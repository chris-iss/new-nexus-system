exports.handler = async (event, context) => {
    try {
        // Extract userId from query parameters
        const userId = event.queryStringParameters.userId;
        console.log("Received userId:", userId); // Log userId for debugging
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing userId parameter" }),
                headers: { "Access-Control-Allow-Origin": "*" }
            };
        }
        // Thinkific API request
        const response = await fetch(`https://api.thinkific.com/api/public/v1/users/${userId}/enrollments`, {
            headers: {
                "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
            }
        });
        if (!response.ok) {
            throw new Error(`Thinkific API returned ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Thinkific API Response:", data);
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: { "Access-Control-Allow-Origin": "*" }
        };
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
            headers: { "Access-Control-Allow-Origin": "*" }
        };
    }
};










