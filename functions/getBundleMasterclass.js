// getBundleMasterclass.js

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
        const { bundleId } = JSON.parse(event.body || "{}");

        if (!bundleId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId is required" })
            };
        }

        // 1️⃣ Fetch bundle
        const bundleRes = await fetch(
            `https://api.thinkific.com/api/public/v1/bundles/${bundleId}`,
            {
                headers: {
                    "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                    "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                }
            }
        );

        if (!bundleRes.ok) {
            throw new Error(`Bundle fetch failed: ${bundleRes.status}`);
        }

        const bundleData = await bundleRes.json();

        // 2️⃣ Extract real course IDs
        const courseIds = Array.isArray(bundleData.course_ids)
            ? bundleData.course_ids
            : [];

        if (courseIds.length === 0) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    bundle: bundleData,
                    courses: []
                })
            };
        }

        // 3️⃣ Fetch course details one-by-one
        const courses = await Promise.all(
            courseIds.map(async (courseId) => {
                try {
                    const res = await fetch(
                        `https://api.thinkific.com/api/public/v1/courses/${courseId}`,
                        {
                            headers: {
                                "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                                "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                            }
                        }
                    );

                    if (!res.ok) return null;
                    return await res.json();
                } catch (err) {
                    console.error("Course fetch error:", err);
                    return null;
                }
            })
        );

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: bundleData,
                courses: courses.filter(Boolean)
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
