const fetch = require("node-fetch");

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { bundleId, userId } = body;

        if (!bundleId || !userId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId and userId are required" })
            };
        }

        const API_KEY = process.env.THINKIFIC_API_KEY;
        const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        // ---------------------------------------------------
        // 1️⃣ Fetch Bundle (with pagination)
        // ---------------------------------------------------
        let page = 1;
        let hasMore = true;
        let allPages = [];

        while (hasMore) {
            const res = await fetch(
                `https://api.thinkific.com/api/public/v1/bundles/${bundleId}?page=${page}&limit=25`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": API_KEY,
                        "X-Auth-Subdomain": SUBDOMAIN
                    }
                }
            );

            const data = await res.json();
            if (!res.ok) {
                return {
                    statusCode: res.status,
                    headers: corsHeaders,
                    body: JSON.stringify(data)
                };
            }

            allPages.push(data);
            hasMore = Array.isArray(data.included_items) && data.included_items.length === 25;
            page++;
        }

        const mergedBundle = { ...allPages[0] };
        mergedBundle.included_items = allPages.flatMap(p => p.included_items || []);
        const bundleCourseIds = mergedBundle.course_ids || [];

        // ---------------------------------------------------
        // 2️⃣ Fetch User Enrollments
        // ---------------------------------------------------
        const enrollmentsRes = await fetch(
            `https://api.thinkific.com/api/public/v1/enrollments?user_id=${userId}&limit=200`,
            {
                headers: {
                    "X-Auth-API-Key": API_KEY,
                    "X-Auth-Subdomain": SUBDOMAIN
                }
            }
        );

        const enrollmentsJson = await enrollmentsRes.json();
        const activeEnrollments = Array.isArray(enrollmentsJson.items)
            ? enrollmentsJson.items.filter(e => e.expired === false)
            : [];

        const enrolledCourseIds = activeEnrollments.map(e => e.course_id);

        // ---------------------------------------------------
        // 3️⃣ Match bundle courses with enrolled courses
        // ---------------------------------------------------
        const matchedCourseIds = bundleCourseIds.filter(id =>
            enrolledCourseIds.includes(id)
        );

        // ---------------------------------------------------
        // 4️⃣ Fetch course details for matched courses
        // ---------------------------------------------------
        let masterclassCourses = [];

        for (const courseId of matchedCourseIds) {
            const courseRes = await fetch(
                `https://api.thinkific.com/api/public/v1/courses/${courseId}`,
                {
                    headers: {
                        "X-Auth-API-Key": API_KEY,
                        "X-Auth-Subdomain": SUBDOMAIN
                    }
                }
            );

            const courseJson = await courseRes.json();

            if (courseRes.ok) {
                masterclassCourses.push({
                    course_id: courseJson.id,
                    course_name: courseJson.name,
                    slug: courseJson.slug,
                    course_card_image_url: courseJson.course_card_image_url,
                    percentage_completed:
                        activeEnrollments.find(e => e.course_id === courseId)
                            ?.percentage_completed ?? 0
                });
            }
        }

        // ---------------------------------------------------
        // 5️⃣ Return data to frontend
        // ---------------------------------------------------
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundleId,
                userId,
                masterclassCourses
            })
        };

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
