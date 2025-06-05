const fetch = require("node-fetch");
require("dotenv").config();

let isExecuting = false;

exports.handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "Preflight OK",
    };
  }

  if (isExecuting) {
    return {
      statusCode: 409,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: "Function is already executing" }),
    };
  }

  isExecuting = true;

  try {
    // Optional API key check
    const queryApiKey = event.queryStringParameters?.API_KEY;
    const validNetlifyApiKey = process.env.Netlify_API_KEY;

    if (queryApiKey && queryApiKey !== validNetlifyApiKey) {
      isExecuting = false;
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        },
        body: JSON.stringify({ message: "Unauthorized Access" }),
      };
    }

    if (!event.body) {
      isExecuting = false;
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        },
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    const { firstName, lastName, email } = JSON.parse(event.body);

    if (!firstName || !lastName || !email) {
      isExecuting = false;
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        },
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const brilliumApiKey = process.env.BRILLIUM_API_KEY;
    const redirectUrl = "https://instituteofsustainability.onlinetests.app/assess.aspx?aid=A0R9EDCMLJ4P&key=aZEzHUB95vdAuLH7";

    const payload = {
      AssessmentId: "A0R9EDCMLJ4P",
      FirstName: firstName,
      LastName: lastName,
      EmailAddress: email,
      RedirectUrl: redirectUrl
    };

    console.log("DATA:", payload)

    const response = await fetch("https://api.brillium.com/api/respondents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Brillium-Api-Key ${brilliumApiKey}`, // ✅ Make sure this is the correct format
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Brillium API error: ${err}`);
    }

    const data = await response.json();

    isExecuting = false;
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: "Success", redirectUrl }),
    };

  } catch (error) {
    console.error("Error registering respondent:", error.message);
    isExecuting = false;
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: error.message }),
    };
  }
};
