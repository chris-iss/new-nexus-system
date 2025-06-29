// exports.handler = async (event, context) => {
//     if (event.httpMethod === "OPTIONS") {
//         return {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com", // Allow your frontend origin
//                 "Access-Control-Allow-Methods": "GET, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type",
//             },
//             body: ""
//         };
//     }

//     try {
//         const userId = event.queryStringParameters?.userId;
//         if (!userId) {
//             return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
//         }

//         const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
//         const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

//         const response = await fetch(`https://api.thinkific.com/api/public/v1/users/${userId}`, {
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-Auth-API-Key": THINKIFIC_API_KEY,
//                 "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
//             }
//         });

//         if (!response.ok) throw new Error(`Thinkific API Error: ${response.status}`);

//         const data = await response.json();
//         return {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
//                 "Access-Control-Allow-Methods": "GET, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type",
//             },
//             body: JSON.stringify(data)
//         };
//     } catch (error) {
//         return {
//             statusCode: 500,
//             headers: {
//                 "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
//                 "Access-Control-Allow-Methods": "GET, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type",
//             },
//             body: JSON.stringify({ error: "Internal Server Error", message: error.message })
//         };
//     }
// };


exports.handler = async (event, context) => {
    if (event.httpMethod === "OPTIONS") {
        // ...
    }

    try {
        const userId = event.queryStringParameters?.userId;
        console.log("Received userId:", userId);
        if (!userId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing userId" }) };
        }

        const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
        const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        if (!THINKIFIC_API_KEY || !THINKIFIC_SUB_DOMAIN) {
            console.error("Missing Thinkific env vars");
            return { statusCode: 500, body: JSON.stringify({ error: "Missing Thinkific env vars" }) };
        }

        console.log("Calling Thinkific API…");
        const response = await fetch(`https://api.thinkific.com/api/public/v1/users/${userId}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-API-Key": THINKIFIC_API_KEY,
                "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
            }
        });
        console.log("Thinkific response status:", response.status);

        if (!response.ok) throw new Error(`Thinkific API Error: ${response.status}`);

        const data = await response.json();
        console.log("Thinkific data:", data);

        return {
            statusCode: 200,
            // headers: { ... },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            // headers: { ... },
            body: JSON.stringify({ error: "Internal Server Error", message: error.message })
        };
    }
};
