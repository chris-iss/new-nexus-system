

// const fetch = require("node-fetch");

// exports.handler = async (event) => {
//     const corsHeaders = {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//     };

//     if (event.httpMethod === "OPTIONS") {
//         return { statusCode: 200, headers: corsHeaders };
//     }

//     try {
//         const body = JSON.parse(event.body || "{}");
//         const { bundleId, userId, userExpiry } = body;

//         if (!bundleId || !userId) {
//             return {
//                 statusCode: 400,
//                 headers: corsHeaders,
//                 body: JSON.stringify({ error: "bundleId and userId are required" })
//             };
//         }

//         console.log("➡ Running for user", userId, "bundle", bundleId);
//         console.log("➡ Received expiry from FE:", userExpiry);

//         const API_KEY = process.env.THINKIFIC_API_KEY;
//         const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

//         // ---------------------------------------------------
//         // 1️⃣ Fetch the Bundle (Pagination)
//         // ---------------------------------------------------
//         let page = 1;
//         let allBundlePages = [];
//         let hasMore = true;

//         while (hasMore) {
//             const res = await fetch(
//                 `https://api.thinkific.com/api/public/v1/bundles/${bundleId}?page=${page}&limit=25`,
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         "X-Auth-API-Key": API_KEY,
//                         "X-Auth-Subdomain": SUBDOMAIN
//                     }
//                 }
//             );

//             const data = await res.json();
//             if (!res.ok) {
//                 return {
//                     statusCode: res.status,
//                     headers: corsHeaders,
//                     body: JSON.stringify(data)
//                 };
//             }

//             allBundlePages.push(data);
//             hasMore = Array.isArray(data.included_items) && data.included_items.length === 25;
//             page++;
//         }

//         // Merge bundle pages
//         const mergedBundle = { ...allBundlePages[0] };
//         mergedBundle.included_items = allBundlePages.flatMap(p => p.included_items || []);
//         const courseIds = mergedBundle.course_ids || [];

//         console.log("📌 Bundle Course IDs:", courseIds);

//         // ---------------------------------------------------
//         // 2️⃣ Fetch User Enrollments
//         // ---------------------------------------------------
//         const enrollmentsRes = await fetch(
//             `https://api.thinkific.com/api/public/v1/enrollments?user_id=${userId}&limit=200`,
//             {
//                 headers: {
//                     "X-Auth-API-Key": API_KEY,
//                     "X-Auth-Subdomain": SUBDOMAIN
//                 }
//             }
//         );

//         const enrollmentJson = await enrollmentsRes.json();
//         const userEnrollments = Array.isArray(enrollmentJson.items) ? enrollmentJson.items : [];

//         console.log("📌 Total user enrollments:", userEnrollments.length);

//         // ---------------------------------------------------
//         // 3️⃣ Use expiry date from frontend
//         // ---------------------------------------------------
//         const userMainExpiryDate = userExpiry ? new Date(userExpiry) : null;

//         console.log("📅 FINAL MEMBERSHIP EXPIRY USED:", userMainExpiryDate);

//         if (!userMainExpiryDate) {
//             console.log("❌ No valid membership expiry found. Skipping auto-enroll.");
//             return {
//                 statusCode: 200,
//                 headers: corsHeaders,
//                 body: JSON.stringify({
//                     bundle: mergedBundle,
//                     autoEnroll: "User inactive — no valid expiry.",
//                     autoEnrollResults: []
//                 })
//             };
//         }

//         // ---------------------------------------------------
//         // 4️⃣ Determine which courses need enrolling
//         // ---------------------------------------------------
//         const alreadyEnrolledIds = userEnrollments
//             .filter(e => e.expired === false)
//             .map(e => e.course_id);

//         const newCoursesToEnroll = courseIds.filter(id => !alreadyEnrolledIds.includes(id));

//         console.log("🆕 New courses for auto-enroll:", newCoursesToEnroll);

//         // ---------------------------------------------------
//         // 5️⃣ Auto-enroll + fetch full course details
//         // ---------------------------------------------------
//         let enrollmentResults = [];

//         for (const courseId of newCoursesToEnroll) {
//             // 🔹 5a: Enroll the user
//             const enrollRes = await fetch(
//                 `https://api.thinkific.com/api/public/v1/enrollments`,
//                 {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "X-Auth-API-Key": API_KEY,
//                         "X-Auth-Subdomain": SUBDOMAIN
//                     },
//                     body: JSON.stringify({
//                         user_id: userId,
//                         course_id: courseId,
//                         activated_at: new Date().toISOString(),
//                         expiry_date: userMainExpiryDate.toISOString()
//                     })
//                 }
//             );

//             const enrollJson = await enrollRes.json();

//             console.log("ENROLLED USER:", enrollJson)

//             // 🔹 5b: Fetch REAL course info for card display
//             const courseRes = await fetch(
//                 `https://api.thinkific.com/api/public/v1/courses/${courseId}`,
//                 {
//                     headers: {
//                         "X-Auth-API-Key": API_KEY,
//                         "X-Auth-Subdomain": SUBDOMAIN
//                     }
//                 }
//             );

//             const courseJson = await courseRes.json();

//             // 🔹 5c: Build final data block for frontend
//             enrollmentResults.push({
//                 courseId,
//                 success: enrollRes.ok,
//                 enrollmentResponse: enrollJson,
//                 course: {
//                     id: courseJson.id,
//                     name: courseJson.name,
//                     slug: courseJson.slug,
//                     course_card_image_url: courseJson.course_card_image_url,
//                     percentage_completed: enrollJson.percentage_completed ?? 0
//                 }
//             });
//         }

//         // ---------------------------------------------------
//         // 6️⃣ Return Full Response
//         // ---------------------------------------------------
//         return {
//             statusCode: 200,
//             headers: corsHeaders,
//             body: JSON.stringify({
//                 bundle: mergedBundle,
//                 autoEnrollResults: enrollmentResults,
//                 appliedExpiryDate: userMainExpiryDate.toISOString()
//             })
//         };

//     } catch (error) {
//         console.error("❌ SERVER ERROR:", error);
//         return {
//             statusCode: 500,
//             headers: corsHeaders,
//             body: JSON.stringify({ error: error.message })
//         };
//     }
// };


// netlify/functions/autoEnrollBundle.js
// npm i node-fetch@2  (if you're on CommonJS + older Netlify runtime)

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
        body: JSON.stringify({ error: "Missing THINKIFIC_API_KEY or THINKIFIC_SUB_DOMAIN env vars" }),
      };
    }

    // ---------------------------------------------------
    // 1️⃣ Fetch bundle courses (pagination) — reliable way
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

    // If the bundle has no courses, stop here.
    if (courseIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          autoEnroll: "No courses found in bundle.",
          bundleId,
          userId,
          autoEnrollResults: [],
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
      userMainExpiryDate.getTime() > Date.now(); // must be in the future

    console.log("📅 FINAL MEMBERSHIP EXPIRY USED:", userMainExpiryDate, "valid:", expiryIsValid);

    if (!expiryIsValid) {
      console.log("❌ Invalid expiry (missing/invalid/not future). Skipping auto-enroll.", userExpiry);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          autoEnroll: "Skipped — invalid expiry date (must be in the future).",
          receivedExpiry: userExpiry,
          autoEnrollResults: [],
        }),
      };
    }

    // ---------------------------------------------------
    // 3️⃣ Fetch user enrollments (paginate) — IMPORTANT
    //     Use query[user_id] to actually filter to user.
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

      // If we got less than limit, no more pages
      hasMore = items.length === 200;
      page += 1;
    }

    console.log("📌 Total user enrollments:", userEnrollments.length);
    console.log("📌 Enrollment sample:", userEnrollments[0] || null);

    // ---------------------------------------------------
    // 4️⃣ Determine which courses need enrolling
    //     (Keep it simple: treat any non-expired enrollment as already enrolled)
    // ---------------------------------------------------
    const alreadyEnrolledIds = userEnrollments
      .filter((e) => e && (e.expired === false || e.expired === 0)) // some APIs may return false/0
      .map((e) => e.course_id);

    const newCoursesToEnroll = courseIds.filter((id) => !alreadyEnrolledIds.includes(id));
    console.log("🆕 New courses for auto-enroll:", newCoursesToEnroll);

    // ---------------------------------------------------
    // 5️⃣ Auto-enroll + fetch full course details
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
      console.log("➡️ Enroll response json:", enrollJson);
      if (!enrollRes.ok) console.log("➡️ Enroll response raw:", enrollRaw);

      // Fetch course info (even if enroll fails, helps debugging/UI)
      const courseRes = await fetch(`https://api.thinkific.com/api/public/v1/courses/${courseId}`, {
        headers: {
          "X-Auth-API-Key": API_KEY,
          "X-Auth-Subdomain": SUBDOMAIN,
        },
      });

      const { json: courseJson } = await safeReadJson(courseRes);

      enrollmentResults.push({
        courseId,
        success: enrollRes.ok,
        enrollStatus: enrollRes.status,
        enrollmentResponse: enrollJson,
        course: {
          id: courseJson?.id ?? courseId,
          name: courseJson?.name ?? null,
          slug: courseJson?.slug ?? null,
          course_card_image_url: courseJson?.course_card_image_url ?? null,
          percentage_completed: enrollJson?.percentage_completed ?? 0,
        },
      });
    }

    // ---------------------------------------------------
    // 6️⃣ Return Full Response
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


