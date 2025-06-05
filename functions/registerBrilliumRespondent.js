const fetch = require("node-fetch");
require("dotenv").config();

let isExecuting = false;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*", // or restrict to a specific domain
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Handle preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "Preflight OK"
    };
  }

  if (isExecuting) {
    return {
      statusCode: 409,
      headers,
      body: JSON.stringify({ message: "Function is already executing" }),
    };
  }

  isExecuting = true;

  try {
    const queryApiKey = event.queryStringParameters?.API_KEY;
    const validNetlifyApiKey = process.env.Netlify_API_KEY;

    if (queryApiKey && queryApiKey !== validNetlifyApiKey) {
      isExecuting = false;
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Unauthorized Access" }),
      };
    }

    const { firstName, lastName, email_ } = JSON.parse(event.body);

    const brilliumApiKey = process.env.BRILLIUM_API_KEY;
    const redirectUrl = "https://instituteofsustainability.onlinetests.app/assess.aspx?aid=A0R9EDCMLJ4P&key=aZEzHUB95vdAuLH7";

    const payload = {
      AssessmentId: "A0R9EDCMLJ4P",
      FirstName: firstName,
      LastName: lastName,
      EmailAddress: email_,
      RedirectUrl: redirectUrl,
    };

    const response = await fetch("https://api.brillium.com/api/respondents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${brilliumApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Brillium API error: ${response.statusText}`);
    }

    const data = await response.json();

    isExecuting = false;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Success", redirectUrl }),
    };

  } catch (error) {
    console.error("Error registering respondent:", error.message);
    isExecuting = false;
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
