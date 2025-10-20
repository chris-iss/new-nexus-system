// // exports.handler = async (event, context) => {
// //     try {
// //         // Extract userId from query parameters
// //         const userId = event.queryStringParameters.userId;
// //         console.log("Received userId:", userId); // Log userId for debugging

// //         if (!userId) {
// //             return {
// //                 statusCode: 400,
// //                 body: JSON.stringify({ error: "Missing userId parameter" }),
// //                 headers: { "Access-Control-Allow-Origin": "*" }
// //             };
// //         }

// //         // Thinkific API request
// //         const response = await fetch(`https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}`, {
// //             headers: {
// //                 "Content-Type": "application/json",
// //                 "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
// //                 "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
// //             }
// //         });

// //         if (!response.ok) {
// //             throw new Error(`Thinkific API returned ${response.status} - ${response.statusText}`);
// //         }

// //         const data = await response.json();
// //         console.log("Thinkific API Response:", data);
        
// //         return {
// //             statusCode: 200,
// //             body: JSON.stringify(data),
// //             headers: { "Access-Control-Allow-Origin": "*" }
// //         };
// //     } catch (error) {
// //         console.error("Error fetching enrollments:", error);
// //         return {
// //             statusCode: 500,
// //             body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
// //             headers: { "Access-Control-Allow-Origin": "*" }
// //         };
// //     }
// // };





// // exports.handler = async (event, context) => {
// //     // Handle CORS preflight request
// //     if (event.httpMethod === "OPTIONS") {
// //         return {
// //             statusCode: 200,
// //             headers: {
// //                 "Access-Control-Allow-Origin": "*",
// //                 "Access-Control-Allow-Methods": "GET, OPTIONS",
// //                 "Access-Control-Allow-Headers": "Content-Type, X-Auth-API-Key, X-Auth-Subdomain"
// //             },
// //             body: ""
// //         };
// //     }

// //     try {
// //         // Extract userId from query parameters
// //         const userId = event.queryStringParameters.userId;
// //         console.log("Received userId:", userId); // Log userId for debugging

// //         if (!userId) {
// //             return {
// //                 statusCode: 400,
// //                 headers: {
// //                     "Access-Control-Allow-Origin": "*",
// //                     "Access-Control-Allow-Methods": "GET, OPTIONS",
// //                     "Access-Control-Allow-Headers": "Content-Type"
// //                 },
// //                 body: JSON.stringify({ error: "Missing userId parameter" })
// //             };
// //         }

// //         // Thinkific API request
// //         const response = await fetch(`https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}`, {
// //             headers: {
// //                 "Content-Type": "application/json",
// //                 "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
// //                 "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
// //             }
// //         });

// //         if (!response.ok) {
// //             throw new Error(`Thinkific API returned ${response.status} - ${response.statusText}`);
// //         }

// //         const data = await response.json();
// //         console.log("Thinkific API Response:", data);
        
// //         return {
// //             statusCode: 200,
// //             headers: {
// //                 "Access-Control-Allow-Origin": "*",
// //                 "Access-Control-Allow-Methods": "GET, OPTIONS",
// //                 "Access-Control-Allow-Headers": "Content-Type"
// //             },
// //             body: JSON.stringify(data)
// //         };
// //     } catch (error) {
// //         console.error("Error fetching enrollments:", error);
// //         return {
// //             statusCode: 500,
// //             headers: {
// //                 "Access-Control-Allow-Origin": "*",
// //                 "Access-Control-Allow-Methods": "GET, OPTIONS",
// //                 "Access-Control-Allow-Headers": "Content-Type"
// //             },
// //             body: JSON.stringify({ error: "Internal Server Error", message: error.message })
// //         };
// //     }
// // };



// exports.handler = async (event, context) => {
//     const corsHeaders = {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, X-Auth-API-Key, X-Auth-Subdomain"
//     };

//     // Handle CORS preflight
//     if (event.httpMethod === "OPTIONS") {
//         return {
//             statusCode: 200,
//             headers: corsHeaders,
//             body: ""
//         };
//     }

//     try {
//         // Log environment variables (for debug only - remove in production)
//         console.log("THINKIFIC_API_KEY:", process.env.THINKIFIC_API_KEY ? "[LOADED]" : "[MISSING]");
//         console.log("THINKIFIC_SUB_DOMAIN:", process.env.THINKIFIC_SUB_DOMAIN ? "[LOADED]" : "[MISSING]");

//         // Check if required env vars are missing
//         if (!process.env.THINKIFIC_API_KEY || !process.env.THINKIFIC_SUB_DOMAIN) {
//             return {
//                 statusCode: 500,
//                 headers: corsHeaders,
//                 body: JSON.stringify({ error: "Missing Thinkific environment variables." })
//             };
//         }

//         const userId = event.queryStringParameters.userId;
//         if (!userId) {
//             return {
//                 statusCode: 400,
//                 headers: corsHeaders,
//                 body: JSON.stringify({ error: "Missing userId parameter" })
//             };
//         }

//         const fetchEnrollments = async () => {
//             const res = await fetch(`https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}`, {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
//                     "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
//                 }
//             });
//             return res;
//         };

//         let response = await fetchEnrollments();

//         // Retry once if the response is not OK
//         if (!response.ok) {
//             console.warn(`Initial Thinkific request failed with status ${response.status}. Retrying...`);
//             await new Promise(res => setTimeout(res, 1000)); // wait 1 second
//             response = await fetchEnrollments();
//         }

//         if (!response.ok) {
//             const errorText = await response.text(); // log full error body
//             console.error(`Thinkific API error after retry: ${response.status} - ${response.statusText}`);
//             console.error("Response body:", errorText);
//             return {
//                 statusCode: 500,
//                 headers: corsHeaders,
//                 body: JSON.stringify({ error: "Thinkific API error", status: response.status, details: errorText })
//             };
//         }

//         const data = await response.json();
//         console.log("Thinkific API Response:", data);

//         return {
//             statusCode: 200,
//             headers: corsHeaders,
//             body: JSON.stringify(data)
//         };
//     } catch (error) {
//         console.error("Unhandled error in getEnrollments:", error);
//         return {
//             statusCode: 500,
//             headers: corsHeaders,
//             body: JSON.stringify({ error: "Internal Server Error", message: error.message })
//         };
//     }
// };

// netlify/functions/getEnrollments.js

const ALLOWED_ORIGIN = "https://courses.instituteofsustainabilitystudies.com";

exports.handler = async (event, context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-API-Key, X-Auth-Subdomain, Authorization",
  };

  // ✅ Handle preflight CORS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
    };
  }

  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing userId parameter" }),
      };
    }

    const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
    const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

    if (!THINKIFIC_API_KEY || !THINKIFIC_SUB_DOMAIN) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing Thinkific environment variables." }),
      };
    }

    const response = await fetch(
      `https://api.thinkific.com/api/public/v1/enrollments?query[user_id]=${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Auth-API-Key": THINKIFIC_API_KEY,
          "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Thinkific API error:", response.status, errorText);
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Thinkific API Error",
          status: response.status,
          details: errorText,
        }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Unhandled error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};









