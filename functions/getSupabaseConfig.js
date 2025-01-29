// .netlify/functions/getSupabaseConfig.js

exports.handler = async function () {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow all origins, or specify your frontend URL for more security
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', // Allow all HTTP methods (or restrict as needed)
      'Access-Control-Allow-Headers': 'Content-Type', // Allow specific headers if necessary
    },
    body: JSON.stringify({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SERVICE_KEY,
      code: process.env.ACTIVATION_CODE, 
    }),
  };
};
