exports.handler = async (event, context) => {
    const userId = event.queryStringParameters.userId;
    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing userId parameter" }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow all origins
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    }
    try {
        // Thinkific API details
        const apiUrl = `https://api.thinkific.com/api/public/v1/users/${userId}/enrollments`;
        const response = await fetch(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
              },
        });
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow requests from any origin
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch data" }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
    }
};