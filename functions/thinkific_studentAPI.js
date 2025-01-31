const fetch = require("node-fetch");
exports.handler = async (event, context) => {
    try {
        // Extract userId from request
        const userId = event.queryStringParameters.userId;
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing userId parameter" }),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                }
            };
        }
        console.log("Fetching enrollments for userId:", userId);
        // Thinkific API details
        const apiUrl = `https://api.thinkific.com/api/public/v1/users/${userId}/enrollments`;
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
              },
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("Thinkific API Error:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Failed to fetch data from Thinkific API", details: data }),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                }
            };
        }
        console.log("Enrollments fetched successfully:", data);
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        };
    } catch (error) {
        console.error("Server error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        };
    }
};












