// import { createClient } from "@supabase/supabase-js";

// const supabase_url = process.env.SUPABASE_URL;
// const supabase_service_key = process.env.SERVICE_KEY;

// export const supabase = createClient(supabase_url, supabase_service_key);

// export const handler = async (event) => {
//     let isExecuting = false;

//     if (isExecuting) {
//         return {
//             statusCode: 409,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//             },
//             body: JSON.stringify({ message: "Function is already executing" }),
//         };
//     }

//     isExecuting = true;

//     try {
//         // Handle CORS preflight (OPTIONS request)
//         if (event.httpMethod === "OPTIONS") {
//             return {
//                 statusCode: 200,
//                 headers: {
//                     "Access-Control-Allow-Origin": "*",
//                     "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//                     "Access-Control-Allow-Headers": "Content-Type",
//                 },
//                 body: "",
//             };
//         }

//         // Example: Fetch data from 'eventUpdate' table
//         const { data, error } = await supabase
//             .from('white_paper')
//             .select('*');

//         if (error) {
//             console.error("Supabase Error:", error);
//             return {
//                 statusCode: 500,
//                 headers: {
//                     "Access-Control-Allow-Origin": "*",
//                 },
//                 body: JSON.stringify({ error: error.message })
//             };
//         }

//         return {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//             },
//             body: JSON.stringify(data)
//         };
//     } catch (error) {
//         console.error("Error processing data:", error.message);

//         return {
//             statusCode: 500,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//             },
//             body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
//         };
//     } finally {
//         isExecuting = false;
//     }
// };


import { createClient } from "@supabase/supabase-js";

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SERVICE_KEY;

const supabase = createClient(supabase_url, supabase_service_key);

const ALLOWED_ORIGIN = "https://courses.instituteofsustainabilitystudies.com";

export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // ✅ Handle preflight (CORS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
    };
  }

  try {
    // Example: Fetch data from 'white_paper' table
    const { data, error } = await supabase.from("white_paper").select("*");

    if (error) {
      console.error("Supabase Error:", error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error processing data:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};

