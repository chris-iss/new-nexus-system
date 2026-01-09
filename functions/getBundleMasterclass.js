
// netlify/functions/getBundleMasterclass.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  // Helper: safe JSON parse from a Response (never throws)
  const safeReadJson = async (res) => {
    const text = await res.text();
    if (!text) return { json: {}, raw: "" };
    try {
      return { json: JSON.parse(text), raw: text };
    } catch (e) {
      return { json: { parseError: e.message }, raw: text };
    }
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { bundleId, userId, userExpiry } = body;

    if (!bundleId || !userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "bundleId and userId are required" }),
      };
    }

    console.log("➡ Running for user", userId, "bundle", bundleId);
    console.log("➡ Received expiry from FE:", userExpiry);

    const API_KEY = process.env.THINKIFIC_API_KEY;
    const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

    if (!API_KEY || !SUBDOMAIN) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Missing THINKIFIC_API_KEY or THINKIFIC_SUB_DOMAIN env vars",
        }),
      };
    }

    // ---------------------------------------------------
    // 1️⃣ Fetch bundle courses (pagination)
    // ---------------------------------------------------
    let bundleCourses = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `https://api.thinkific.com/api/public/v1/bundles/${bundleId}/courses?page=${page}&limit=25`,
        {
          headers: {
            "X-Auth-API-Key": API_KEY,
            "X-Auth-Subdomain": SUBDOMAIN,
          },
        }
      );

      const { json: data } = await safeReadJson(res);

      if (!res.ok) {
        console.log("❌ Bundle courses fetch failed:", res.status, data);
        return {
          statusCode: res.status,
          headers: corsHeaders,
          body: JSON.stringify(data),
        };
      }

      const items = Array.isArray(data.items) ? data.items : [];
      bundleCourses.push(...items);

      hasMore = items.length === 25;
      page += 1;
    }

    const courseIds = bundleCourses.map((c) => c.id).filter(Boolean);
    console.log("📌 Bundle Course IDs:", courseIds);

    if (courseIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          bundleId,
          userId,
          bundleCourseCount: 0,
          newCoursesAttempted: [],
          autoEnrollResults: [],
          bundleCoursesForDisplay: [],
        }),
      };
    }

    // ---------------------------------------------------
    // 2️⃣ Validate expiry (must be real + future date)
    // ---------------------------------------------------
    const userMainExpiryDate = userExpiry ? new Date(userExpiry) : null;
    const expiryIsValid =
      userMainExpiryDate &&
      !Number.isNaN(userMainExpiryDate.getTime()) &&
      userMainExpiryDate.getTime() > Date.now();

    console.log("📅 FINAL MEMBERSHIP EXPIRY USED:", userMainExpiryDate, "valid:", expiryIsValid);

    if (!expiryIsValid) {
  console.log("❌ Invalid expiry — skipping auto-enroll, but returning display courses.");

  // Fetch user enrollments anyway (so we can show already-enrolled courses)
  let userEnrollments = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const enrollmentsRes = await fetch(
      `https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}&page=${page}&limit=200`,
      {
        headers: {
          "X-Auth-API-Key": API_KEY,
          "X-Auth-Subdomain": SUBDOMAIN,
        },
      }
    );

    const { json: enrollmentJson } = await safeReadJson(enrollmentsRes);

    if (!enrollmentsRes.ok) {
      return {
        statusCode: enrollmentsRes.status,
        headers: corsHeaders,
        body: JSON.stringify(enrollmentJson),
      };
    }

    const items = Array.isArray(enrollmentJson.items) ? enrollmentJson.items : [];
    userEnrollments.push(...items);
    hasMore = items.length === 200;
    page += 1;
  }

  const enrollmentByCourseId = new Map();
  for (const e of userEnrollments) {
    if (e && e.course_id != null) enrollmentByCourseId.set(e.course_id, e);
  }

  // Build display list (DO NOT filter by "enrolled" here)
  const bundleCoursesForDisplay = [];
  for (const courseId of courseIds) {
    const courseRes = await fetch(
      `https://api.thinkific.com/api/public/v1/courses/${courseId}`,
      {
        headers: {
          "X-Auth-API-Key": API_KEY,
          "X-Auth-Subdomain": SUBDOMAIN,
        },
      }
    );

    const { json: courseJson } = await safeReadJson(courseRes);
    const enr = enrollmentByCourseId.get(courseId);

    bundleCoursesForDisplay.push({
      id: courseJson?.id ?? courseId,
      name: courseJson?.name ?? null,
      slug: courseJson?.slug ?? null,
      course_card_image_url: courseJson?.course_card_image_url ?? null,
      enrolled: !!enr && enr.expired === false,
      expired: enr ? !!enr.expired : false,
      expiry_date: enr?.expiry_date ?? null,
      percentage_completed: enr?.percentage_completed ?? 0,
    });
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      bundleId,
      userId,
      bundleCourseCount: courseIds.length,
      autoEnroll: "Skipped — invalid expiry date.",
      receivedExpiry: userExpiry,
      autoEnrollResults: [],
      bundleCoursesForDisplay, // ✅ ALWAYS sent
    }),
  };
}


    // ---------------------------------------------------
    // 3️⃣ Fetch user enrollments (paginate) — filtered to user
    // ---------------------------------------------------
    let userEnrollments = [];
    page = 1;
    hasMore = true;

    while (hasMore) {
      const enrollmentsRes = await fetch(
        `https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}&page=${page}&limit=200`,
        {
          headers: {
            "X-Auth-API-Key": API_KEY,
            "X-Auth-Subdomain": SUBDOMAIN,
          },
        }
      );

      const { json: enrollmentJson } = await safeReadJson(enrollmentsRes);

      if (!enrollmentsRes.ok) {
        console.log("❌ Enrollments fetch failed:", enrollmentsRes.status, enrollmentJson);
        return {
          statusCode: enrollmentsRes.status,
          headers: corsHeaders,
          body: JSON.stringify(enrollmentJson),
        };
      }

      const items = Array.isArray(enrollmentJson.items) ? enrollmentJson.items : [];
      userEnrollments.push(...items);

      hasMore = items.length === 200;
      page += 1;
    }

    console.log("📌 Total user enrollments:", userEnrollments.length);

    // ---------------------------------------------------
    // 4️⃣ Determine which bundle courses need enrolling
    // ---------------------------------------------------
    const enrollmentByCourseId = new Map();
    for (const e of userEnrollments) {
      if (e && e.course_id != null) enrollmentByCourseId.set(e.course_id, e);
    }

    const alreadyEnrolledIds = userEnrollments
      .filter((e) => e && (e.expired === false || e.expired === 0))
      .map((e) => e.course_id);

    const newCoursesToEnroll = courseIds.filter((id) => !alreadyEnrolledIds.includes(id));
    console.log("🆕 New courses for auto-enroll:", newCoursesToEnroll);

    // ---------------------------------------------------
    // 5️⃣ Auto-enroll missing courses
    // ---------------------------------------------------
    let enrollmentResults = [];

    for (const courseId of newCoursesToEnroll) {
      const payload = {
        user_id: userId,
        course_id: courseId,
        activated_at: new Date().toISOString(),
        expiry_date: userMainExpiryDate.toISOString(),
      };

      console.log("➡️ Enrolling payload:", payload);

      const enrollRes = await fetch(`https://api.thinkific.com/api/public/v1/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-API-Key": API_KEY,
          "X-Auth-Subdomain": SUBDOMAIN,
        },
        body: JSON.stringify(payload),
      });

      const { json: enrollJson, raw: enrollRaw } = await safeReadJson(enrollRes);

      console.log("➡️ Enroll POST status:", enrollRes.status, "ok:", enrollRes.ok);
      if (!enrollRes.ok) console.log("➡️ Enroll response raw:", enrollRaw);

      enrollmentResults.push({
        courseId,
        success: enrollRes.ok,
        enrollStatus: enrollRes.status,
        enrollmentResponse: enrollJson,
      });
    }

    // ---------------------------------------------------
    // 6️⃣ Re-fetch enrollments (so display data is correct after auto-enroll)
    // ---------------------------------------------------
    userEnrollments = [];
    page = 1;
    hasMore = true;

    while (hasMore) {
      const enrollmentsRes = await fetch(
        `https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}&page=${page}&limit=200`,
        {
          headers: {
            "X-Auth-API-Key": API_KEY,
            "X-Auth-Subdomain": SUBDOMAIN,
          },
        }
      );

      const { json: enrollmentJson } = await safeReadJson(enrollmentsRes);

      if (!enrollmentsRes.ok) {
        console.log("❌ Enrollments re-fetch failed:", enrollmentsRes.status, enrollmentJson);
        return {
          statusCode: enrollmentsRes.status,
          headers: corsHeaders,
          body: JSON.stringify(enrollmentJson),
        };
      }

      const items = Array.isArray(enrollmentJson.items) ? enrollmentJson.items : [];
      userEnrollments.push(...items);

      hasMore = items.length === 200;
      page += 1;
    }

    const enrollmentByCourseId2 = new Map();
    for (const e of userEnrollments) {
      if (e && e.course_id != null) enrollmentByCourseId2.set(e.course_id, e);
    }

    // ---------------------------------------------------
    // 7️⃣ Build bundleCoursesForDisplay ALWAYS (this is Option A)
    //     For each bundle course:
    //       - attach slug/image/name from course endpoint
    //       - attach percentage_completed/expired from enrollment if present
    // ---------------------------------------------------
    const bundleCoursesForDisplay = [];

    for (const courseId of courseIds) {
      // Fetch course details
      const courseRes = await fetch(`https://api.thinkific.com/api/public/v1/courses/${courseId}`, {
        headers: {
          "X-Auth-API-Key": API_KEY,
          "X-Auth-Subdomain": SUBDOMAIN,
        },
      });
      const { json: courseJson } = await safeReadJson(courseRes);

      // Find enrollment (if any)
      const enr = enrollmentByCourseId2.get(courseId);

      bundleCoursesForDisplay.push({
        id: courseJson?.id ?? courseId,
        name: courseJson?.name ?? null,
        slug: courseJson?.slug ?? null,
        course_card_image_url: courseJson?.course_card_image_url ?? null,

        // enrollment fields (always provide defaults)
        enrolled: !!enr && (enr.expired === false || enr.expired === 0),
        expired: enr ? !!enr.expired : false,
        expiry_date: enr?.expiry_date ?? null,
        activated_at: enr?.activated_at ?? null,
        percentage_completed: enr?.percentage_completed ?? 0,
      });
    }

    // Optional: only show actively enrolled bundle courses on FE
    // (If you want to show all bundle courses regardless, remove this filter)
    const activeBundleCoursesForDisplay = bundleCoursesForDisplay.filter((c) => c.enrolled);

    // ---------------------------------------------------
    // 8️⃣ Return Full Response (NOW ALWAYS HAS bundleCoursesForDisplay)
    // ---------------------------------------------------
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        bundleId,
        userId,
        bundleCourseCount: courseIds.length,
        userEnrollmentsCount: userEnrollments.length,
        newCoursesAttempted: newCoursesToEnroll,
        autoEnrollResults: enrollmentResults,
        appliedExpiryDate: userMainExpiryDate.toISOString(),

        // ✅ this is the key output for Option A
        bundleCoursesForDisplay,
      }),
    };
  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
    };
  }
};
