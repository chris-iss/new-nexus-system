// netlify/functions/getBundleMasterclass.js
const fetch = require("node-fetch");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Helper: safe JSON parse from a Response (never throws)
async function safeReadJson(res) {
  const text = await res.text();
  if (!text) return { json: {}, raw: "" };
  try {
    return { json: JSON.parse(text), raw: text };
  } catch (e) {
    return { json: { parseError: e.message }, raw: text };
  }
}

function thinkificHeaders(API_KEY, SUBDOMAIN) {
  return {
    "X-Auth-API-Key": API_KEY,
    "X-Auth-Subdomain": SUBDOMAIN,
  };
}

async function fetchAllBundleCourses({ bundleId, API_KEY, SUBDOMAIN }) {
  const items = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `https://api.thinkific.com/api/public/v1/bundles/${bundleId}/courses?page=${page}&limit=25`,
      { headers: thinkificHeaders(API_KEY, SUBDOMAIN) }
    );

    const { json: data, raw } = await safeReadJson(res);

    if (!res.ok) {
      console.log("❌ Bundle courses fetch failed:", res.status, data, raw);
      return { ok: false, status: res.status, data };
    }

    const pageItems = Array.isArray(data.items) ? data.items : [];
    items.push(...pageItems);

    hasMore = pageItems.length === 25;
    page += 1;
  }

  return { ok: true, items };
}

async function fetchAllUserEnrollments({ userId, API_KEY, SUBDOMAIN }) {
  const items = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}&page=${page}&limit=200`,
      { headers: thinkificHeaders(API_KEY, SUBDOMAIN) }
    );

    const { json: data, raw } = await safeReadJson(res);

    if (!res.ok) {
      console.log("❌ Enrollments fetch failed:", res.status, data, raw);
      return { ok: false, status: res.status, data };
    }

    const pageItems = Array.isArray(data.items) ? data.items : [];
    items.push(...pageItems);

    hasMore = pageItems.length === 200;
    page += 1;
  }

  return { ok: true, items };
}

async function fetchCourseDetails({ courseId, API_KEY, SUBDOMAIN }) {
  const res = await fetch(
    `https://api.thinkific.com/api/public/v1/courses/${courseId}`,
    { headers: thinkificHeaders(API_KEY, SUBDOMAIN) }
  );

  const { json: data } = await safeReadJson(res);
  if (!res.ok) {
    // Don’t hard-fail the whole request if one course fetch fails
    console.log("⚠️ Course details fetch failed:", courseId, res.status, data);
    return { id: courseId, name: null, slug: null, course_card_image_url: null };
  }

  return {
    id: data?.id ?? courseId,
    name: data?.name ?? null,
    slug: data?.slug ?? null,
    course_card_image_url: data?.course_card_image_url ?? null,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { bundleId, userId } = body;

    if (!bundleId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "bundleId is required" }),
      };
    }

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

    // 1) Fetch bundle courses (IDs)
    const bundleRes = await fetchAllBundleCourses({ bundleId, API_KEY, SUBDOMAIN });
    if (!bundleRes.ok) {
      return {
        statusCode: bundleRes.status,
        headers: corsHeaders,
        body: JSON.stringify(bundleRes.data),
      };
    }

    const courseIds = bundleRes.items.map((c) => c.id).filter(Boolean);

    if (courseIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          bundleId,
          userId: userId ?? null,
          bundleCourseCount: 0,
          bundleCoursesForDisplay: [],
        }),
      };
    }

    // 2) (Optional) Fetch user enrollments for course status/progress
    let enrollmentByCourseId = new Map();
    let userEnrollmentsCount = 0;

    if (userId) {
      const enrRes = await fetchAllUserEnrollments({ userId, API_KEY, SUBDOMAIN });
      if (!enrRes.ok) {
        return {
          statusCode: enrRes.status,
          headers: corsHeaders,
          body: JSON.stringify(enrRes.data),
        };
      }

      userEnrollmentsCount = enrRes.items.length;
      for (const e of enrRes.items) {
        if (e && e.course_id != null) enrollmentByCourseId.set(e.course_id, e);
      }
    }

    // 3) Build display list (course details + enrollment fields if available)
    // Fetch course details in parallel (keep it simple; if you hit rate limits, we can chunk these)
    const courseDetailsList = await Promise.all(
      courseIds.map((courseId) => fetchCourseDetails({ courseId, API_KEY, SUBDOMAIN }))
    );

    const bundleCoursesForDisplay = courseDetailsList.map((course) => {
      const enr = userId ? enrollmentByCourseId.get(course.id) : null;

      return {
        id: course.id,
        name: course.name,
        slug: course.slug,
        course_card_image_url: course.course_card_image_url,

        // enrollment fields (defaults if userId not provided or no enrollment found)
        enrolled: !!enr && (enr.expired === false || enr.expired === 0),
        expired: enr ? !!enr.expired : false,
        expiry_date: enr?.expiry_date ?? null,
        activated_at: enr?.activated_at ?? null,
        percentage_completed: enr?.percentage_completed ?? 0,
      };
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        bundleId,
        userId: userId ?? null,
        bundleCourseCount: courseIds.length,
        userEnrollmentsCount,
        bundleCoursesForDisplay,
      }),
    };
  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
