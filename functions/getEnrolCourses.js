const fetch = require("node-fetch");
exports.handler = async (event) => {
    try {
        const { THINKIFIC_API_KEY, THINKIFIC_SUB_DOMAIN } = process.env;
        const userId = event.queryStringParameters.user_id;
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "User ID is required" })
            };
        }
        const response = await fetch(`https://api.thinkific.com/api/public/v1/enrollments?user_id=${userId}`, {
            headers: {
                "X-Auth-API-Key": THINKIFIC_API_KEY,
                "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
            }
        });
        const data = await response.json();
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" }, // Enable CORS
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch enrollments", details: error.message })
        };
    }
};
