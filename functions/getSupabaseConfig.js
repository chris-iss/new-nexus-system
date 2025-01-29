exports.handler = async function () {
    return {
      statusCode: 200,
      body: JSON.stringify({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SERVICE_KEY, // Securely accessed on the server
      }),
    };
  };
  