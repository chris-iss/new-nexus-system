exports.handler = async (event, context) => {
    // Handle CORS preflight request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Auth-API-Key, X-Auth-Subdomain",
                "Access-Control-Allow-Credentials": "true"
            },
            body: ""
        };
    }

    try {
        // Extract userId from query parameters
        const userId = event.queryStringParameters?.userId;
        console.log("Received userId:", userId);

        if (!userId) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Credentials": "true"
                },
                body: JSON.stringify({ error: "Missing userId parameter" })
            };
        }

        // Ensure API keys are set
        const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
        const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        if (!THINKIFIC_API_KEY || !THINKIFIC_SUB_DOMAIN) {
            console.error("Missing Thinkific API credentials.");
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Credentials": "true"
                },
                body: JSON.stringify({ error: "Internal Server Error", message: "Missing Thinkific API credentials" })
            };
        }

        // Thinkific API request
        const response = await fetch(`https://api.thinkific.com/api/public/v1/users?query[user_id]=${userId}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-API-Key": THINKIFIC_API_KEY,
                "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
            }
        });

        // Handle non-OK responses from Thinkific
        if (!response.ok) {
            const errorText = await response.text(); // Read response even if it's not JSON
            console.error(`Thinkific API Error: ${response.status} - ${response.statusText}`, errorText);
            return {
                statusCode: response.status,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Credentials": "true"
                },
                body: JSON.stringify({
                    error: `Thinkific API Error ${response.status}`,
                    message: response.statusText,
                    details: errorText
                })
            };
        }

        // Parse JSON response safely
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error("Failed to parse Thinkific API response as JSON:", jsonError);
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Credentials": "true"
                },
                body: JSON.stringify({ error: "Invalid JSON response from Thinkific" })
            };
        }

        console.log("Thinkific API Response:", data);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Credentials": "true"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Credentials": "true"
            },
            body: JSON.stringify({ error: "Internal Server Error", message: error.message })
        };
    }
};
