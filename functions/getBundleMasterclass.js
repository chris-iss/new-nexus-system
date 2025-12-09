// getBundleMasterclass.js

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle OPTIONS preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const bundleId = body.bundleId;

        if (!bundleId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId is required" })
            };
        }

        // ------------------------------
        // 1️⃣ FETCH BUNDLE
        // ------------------------------
        const bundleRes = await fetch(
            `https://api.thinkific.com/api/public/v1/bundles/${bundleId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                    "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                }
            }
        );

        if (!bundleRes.ok) {
            const errorText = await bundleRes.text();
            throw new Error(`Bundle fetch failed: ${bundleRes.status} — ${errorText}`);
        }

        const bundleData = await bundleRes.json();

        // Extract course IDs from the bundle
        const courseIds = (bundleData.included_items || [])
            .filter(item => item.type === "Course")
            .map(item => item.id);

        if (!courseIds.length) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    bundle: bundleData,
                    courses: []
                })
            };
        }

        // ------------------------------
        // 2️⃣ FETCH EACH COURSE INDIVIDUALLY
        // ------------------------------
        const courseRequests = courseIds.map(async (courseId) => {
            try {
                const res = await fetch(
                    `https://api.thinkific.com/api/public/v1/courses/${courseId}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                            "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                        }
                    }
                );

                if (!res.ok) {
                    console.error(`Failed to fetch course ${courseId}:`, res.status);
                    return null;
                }

                return await res.json();
            } catch (err) {
                console.error("Error fetching course:", courseId, err);
                return null;
            }
        });

        const courseResults = await Promise.all(courseRequests);

        // Filter out failed fetches
        const matchedCourses = courseResults.filter(Boolean);

        // ------------------------------
        // 3️⃣ RETURN FINAL RESPONSE
        // ------------------------------
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: bundleData,
                courses: matchedCourses
            })
        };

    } catch (err) {
        console.error("Server Error:", err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
