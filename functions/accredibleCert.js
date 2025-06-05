const fetch = require("node-fetch");
require("dotenv").config();

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com", // restrict to only your frontend
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    const requestBody = JSON.parse(event.body || "{}");

    // OPTIONAL: Validate incoming fields
    const { action, payload } = requestBody;
    if (!action || !payload) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Missing required fields" })
      };
    }

    // // Forward to Zapier or external service
    // await fetch("https://hooks.zapier.com/hooks/catch/14129819/2vgev9d/", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ status: action, payload })
    // });

    console.log("DATA:", payload)

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Success" })
    };

  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: error.message })
    };
  }
};
