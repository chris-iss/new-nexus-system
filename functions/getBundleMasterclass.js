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
                body: JSON.stringify({ error: "Missing bundleId" })
            };
        }

        // 1️⃣ FETCH BUNDLE
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

        const courseIds = (bundleData.included_items || [])
            .filter(i => i.type === "Course")
            .map(i => i.id);

        // 2️⃣ FETCH ALL COURSES
        const allCoursesRes = await fetch(
            `https://api.thinkific.com/api/public/v1/courses`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                    "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                }
            }
        );

        const allCoursesData = await allCoursesRes.json();
        const allCourses = allCoursesData.items || [];

        // 3️⃣ MATCH COURSES BY ID
        const filteredCourses = allCourses.filter(course =>
            courseIds.includes(course.id)
        );

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: bundleData,
                courses: filteredCourses
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
