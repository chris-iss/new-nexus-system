// getBundleCourses.js
exports.handler = async (event) => {
    // CORS
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: ""
        };
    }

    try {
        const { bundleId } = JSON.parse(event.body || "{}");

        if (!bundleId) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
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
        const courseRequests = courseIds.map(id =>
            fetch(`https://api.thinkific.com/api/public/v1/courses/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                    "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                }
            }).then(res => res.json())
        );

        const courseList = await Promise.all(courseRequests);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                bundle: bundleData,
                courses: courseList
            })
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
