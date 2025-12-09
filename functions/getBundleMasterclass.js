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
        const bundleId = body.bundleId;

        if (!bundleId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId is required" })
            };
        }

        // ------------------------------
        // 1️⃣ FETCH BUNDLE DATA
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

        const bundleData = await bundleRes.json();

        console.log("BUNDLE DATA:", bundleData);

        if (!bundleRes.ok) {
            return {
                statusCode: bundleRes.status,
                headers: corsHeaders,
                body: JSON.stringify(bundleData)
            };
        }

        // 🔥 DIRECT course_ids[] (WORKS ON GROW)
        const courseIds = bundleData.course_ids || [];

        console.log("FOUND COURSE IDS:", courseIds);

        if (courseIds.length === 0) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ bundle: bundleData, courses: [] })
            };
        }

        // ------------------------------
        // 2️⃣ FETCH COURSES DIRECTLY
        // ------------------------------
        const courseRequests = courseIds.map(async (id) => {
            console.log(`Fetching Course ${id}...`);

            const courseRes = await fetch(
                `https://api.thinkific.com/api/public/v1/courses/${id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                    }
                }
            );

            const courseData = await courseRes.json();
            console.log(`COURSE ${id} DATA:`, courseData);

            return courseRes.ok ? courseData : null;
        });

        const resolvedCourses = await Promise.all(courseRequests);
        const courses = resolvedCourses.filter(Boolean);

        // ------------------------------
        // 3️⃣ RETURN FINAL RESPONSE
        // ------------------------------
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: bundleData,
                courses
            })
        };

    } catch (error) {
        console.error("SERVER ERROR:", error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
