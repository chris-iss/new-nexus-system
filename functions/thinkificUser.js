exports.handler = async (event, context) => {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com", // Allow your frontend origin
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: ""
        };
    }

    try {
        const userId = event.queryStringParameters?.userId;
        if (!userId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
        }

        const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
        const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        const response = await fetch(`https://api.thinkific.com/api/public/v1/users/${userId}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-API-Key": THINKIFIC_API_KEY,
                "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
            }
        });

        if (!response.ok) throw new Error(`Thinkific API Error: ${response.status}`);

        const data = await response.json();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: "Internal Server Error", message: error.message })
        };
    }
};


// exports.handler = async (event, context) => {
//     if (event.httpMethod === "OPTIONS") {
//         return {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin": "*", // Allow your frontend origin
//                 "Access-Control-Allow-Methods": "GET, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type",
//             },
//             body: ""
//         };
//     }

//     try {
//         const userId = event.queryStringParameters?.userId;
//         if (!userId) {
//             console.log("[ThinkificUser] Missing userId in query params.", event.queryStringParameters);
//             return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
//         }

//         const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
//         const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

//         if (!THINKIFIC_API_KEY || !THINKIFIC_SUB_DOMAIN) {
//             console.log("[ThinkificUser] Missing Thinkific API credentials.", {
//                 THINKIFIC_API_KEY: !!THINKIFIC_API_KEY,
//                 THINKIFIC_SUB_DOMAIN: !!THINKIFIC_SUB_DOMAIN,
//             });
//             return {
//                 statusCode: 500,
//                 headers: {
//                     "Access-Control-Allow-Origin": "*",
//                     "Access-Control-Allow-Methods": "GET, OPTIONS",
//                     "Access-Control-Allow-Headers": "Content-Type",
//                 },
//                 body: JSON.stringify({ error: "Internal Server Error", message: "Missing Thinkific API credentials" })
//             };
//         }

//         console.log(`[ThinkificUser] Fetching Thinkific userId: ${userId}`);

//         const response = await fetch(`https://api.thinkific.com/api/public/v1/users/${userId}`, {
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-Auth-API-Key": THINKIFIC_API_KEY,
//                 "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
//             }
//         });

//         if (!response.ok) {
//             console.log(`[ThinkificUser] Thinkific API Error: ${response.status} for userId: ${userId}`);
//             throw new Error(`Thinkific API Error: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log(`[ThinkificUser] Success for userId: ${userId} | Data:`, data);

//         return {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Access-Control-Allow-Methods": "GET, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type",
//             },
//             body: JSON.stringify(data)
//         };
//     } catch (error) {
//         console.log("[ThinkificUser] Caught error:", error);
//         return {
//             statusCode: 500,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Access-Control-Allow-Methods": "GET, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type",
//             },
//             body: JSON.stringify({ error: "Internal Server Error", message: error.message })
//         };
//     }
// };
