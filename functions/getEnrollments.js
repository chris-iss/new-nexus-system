// exports.handler = async (event, context) => {
//     try {
//         // Extract userId from query parameters
//         const userId = event.queryStringParameters.userId;
//         console.log("Received userId:", userId); // Log userId for debugging

//         if (!userId) {
//             return {
//                 statusCode: 400,
//                 body: JSON.stringify({ error: "Missing userId parameter" }),
//                 headers: { "Access-Control-Allow-Origin": "*" }
//             };
//         }

//         // Thinkific API request
//         const response = await fetch(`https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}`, {
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
//                 "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`Thinkific API returned ${response.status} - ${response.statusText}`);
//         }

//         const data = await response.json();
//         console.log("Thinkific API Response:", data);
        
//         return {
//             statusCode: 200,
//             body: JSON.stringify(data),
//             headers: { "Access-Control-Allow-Origin": "*" }
//         };
//     } catch (error) {
//         console.error("Error fetching enrollments:", error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
//             headers: { "Access-Control-Allow-Origin": "*" }
//         };
//     }
// };





exports.handler = async (event, context) => {
    // Handle CORS preflight request
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Auth-API-Key, X-Auth-Subdomain"
            },
            body: ""
        };
    }

    try {
        // Extract userId from query parameters
        const userId = event.queryStringParameters.userId;
        console.log("Received userId:", userId); // Log userId for debugging

        if (!userId) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: JSON.stringify({ error: "Missing userId parameter" })
            };
        }

        // Thinkific API request
        const response = await fetch(`https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}`, {
            headers: {
                "Content-Type": "application/json",
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
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ error: "Internal Server Error", message: error.message })
        };
    }
};










