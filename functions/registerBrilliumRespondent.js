const fetch = require("node-fetch");
require("dotenv").config();

let isExecuting = false;

exports.handler = async (event) => {
  if (isExecuting) {
    return {
      statusCode: 409,
      body: JSON.stringify({ message: "Function is already executing" }),
    };
  }

  isExecuting = true;

  try {
    // Optional: API key check via query param
    const queryApiKey = event.queryStringParameters?.API_KEY;
    const validNetlifyApiKey = process.env.Netlify_API_KEY;

    if (queryApiKey && queryApiKey !== validNetlifyApiKey) {
      isExecuting = false;
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized Access" }),
      };
    }

    // Ensure we have a POST body
    if (!event.body) {
      isExecuting = false;
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    // Parse input body
    const { firstName, lastName, email } = JSON.parse(event.body);

    if (!firstName || !lastName || !email) {
      isExecuting = false;
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    // API credentials
    const brilliumApiKey = process.env.BRILLIUM_API_KEY;
    const redirectUrl = "https://instituteofsustainability.onlinetests.app/assess.aspx?aid=A0R9EDCMLJ4P&key=aZEzHUB95vdAuLH7";

    const payload = {
      AssessmentId: "A0R9EDCMLJ4P",
      FirstName: firstName,
      LastName: lastName,
      EmailAddress: email,
      RedirectUrl: redirectUrl
    };

    const response = await fetch("https://api.brillium.com/api/respondents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ✅ Corrected Authorization header
        Authorization: `Brillium-Api-Key ${brilliumApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brillium API error: ${errorText}`);
    }

    const data = await response.json();

    isExecuting = false;
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success", redirectUrl }),
    };

  } catch (error) {
    console.error("Error registering respondent:", error.message);
    isExecuting = false;
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
