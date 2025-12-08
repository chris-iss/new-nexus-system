

// import { createClient } from "@supabase/supabase-js";

// const supabase_url = process.env.SUPABASE_URL;
// const supabase_service_key = process.env.SERVICE_KEY;

// const supabase = createClient(supabase_url, supabase_service_key);

// const ALLOWED_ORIGIN = "https://courses.instituteofsustainabilitystudies.com";

// export const handler = async (event) => {
//   const corsHeaders = {
//     "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
//     "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
//   };

//   // ✅ Handle preflight CORS request
//   if (event.httpMethod === "OPTIONS") {
//     return {
//       statusCode: 204, // No content
//       headers: corsHeaders,
//     };
//   }

//   try {
//     // Fetch data from 'exclude_community_access' table
//     const { data, error } = await supabase.from("exclude_community_access").select("*");

//     if (error) {
//       console.error("Supabase Error:", error);
//       return {
//         statusCode: 500,
//         headers: corsHeaders,
//         body: JSON.stringify({ error: error.message }),
//       };
//     }

//     return {
//       statusCode: 200,
//       headers: corsHeaders,
//       body: JSON.stringify(data),
//     };
//   } catch (error) {
//     console.error("Error processing data:", error);
//     return {
//       statusCode: 500,
//       headers: corsHeaders,
//       body: JSON.stringify({
//         message: "Internal Server Error",
//         error: error.message,
//       }),
//     };
//   }
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

  // --- Handle Preflight Request ---
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
    };
  }

  try {
    // Fetch data from Supabase table
    const { data, error } = await supabase
      .from("exclude_community_access")
      .select("*");

    if (error) {
      console.error("Supabase Error:", error.message);
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
    console.error("Server Error:", error.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
    };
  }
};
