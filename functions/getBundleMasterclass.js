exports.handler = async (event) => {

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: corsHeaders,
        };
    }

    try {
        // Require POST + body
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Request body missing. bundleId is required." })
            };
        }

        const { bundleId } = JSON.parse(event.body);

        if (!bundleId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Missing bundleId" })
            };
        }

        // Fetch bundle details
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
            throw new Error(`Bundle fetch failed: ${bundleRes.status}`);
        }

        const bundleData = await bundleRes.json();

        // Extract course IDs
        const courseIds = (bundleData.included_items || [])
            .filter(item => item.type === "Course")
            .map(item => item.id);

        // Fetch each course
        const courseList = await Promise.all(
            courseIds.map(id =>
                fetch(`https://api.thinkific.com/api/public/v1/courses/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                    }
                }).then(res => res.json())
            )
        );

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ bundle: bundleData, courses: courseList })
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
