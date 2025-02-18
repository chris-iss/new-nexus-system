// const fetch = require("node-fetch");

// exports.handler = async (event) => {
//     try {
//         const { THINKIFIC_API_KEY, THINKIFIC_SUB_DOMAIN } = process.env;
//         const courseId = event.queryStringParameters.course_id;

//         if (!courseId) {
//             return {
//                 statusCode: 400,
//                 body: JSON.stringify({ error: "Course ID is required" })
//             };
//         }

//         const response = await fetch(`https://api.thinkific.com/api/public/v1/courses/${courseId}`, {
//             headers: {
//                 "X-Auth-API-Key": THINKIFIC_API_KEY,
//                 "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
//             }
//         });

//         const data = await response.json();
        
//         return {
//             statusCode: 200,
//             headers: { "Access-Control-Allow-Origin": "*" }, // Enable CORS
//             body: JSON.stringify(data)
//         };
//     } catch (error) {
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: "Failed to fetch course", details: error.message })
//         };
//     }
// };



exports.handler = async (event) => {
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
        const { THINKIFIC_API_KEY, THINKIFIC_SUB_DOMAIN } = process.env;
        const courseId = event.queryStringParameters.course_id;

        if (!courseId) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: JSON.stringify({ error: "Course ID is required" })
            };
        }

        const response = await fetch(`https://api.thinkific.com/api/public/v1/courses/${courseId}`, {
            headers: {
                "X-Auth-API-Key": THINKIFIC_API_KEY,
                "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
            }
        });

        const data = await response.json();

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
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ error: "Failed to fetch course", details: error.message })
        };
    }
};
