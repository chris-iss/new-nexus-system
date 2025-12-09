exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: corsHeaders };
    }

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Request body missing. bundleId is required." })
            };
        }

        const { bundleId } = JSON.parse(event.body);

        // 1. GET BUNDLE DETAILS (ADMIN API)
        const bundleRes = await fetch(
            `https://api.thinkific.com/api/admin/v1/bundles/${bundleId}`,
            {
                headers: {
                    "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                    "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                }
            }
        );

        const bundleData = await bundleRes.json();

        // 2. GET ALL COURSES IN BUNDLE (ADMIN API)
        const coursesRes = await fetch(
            `https://api.thinkific.com/api/admin/v1/bundles/${bundleId}/courses`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                    "X-Auth-User": process.env.THINKIFIC_ADMIN_EMAIL
                }

            }
        );

        const courses = await coursesRes.json();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: bundleData,
                courses: courses.items || []
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
