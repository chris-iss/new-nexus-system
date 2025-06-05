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
    // Optional: API key check
    const queryApiKey = event.queryStringParameters?.API_KEY;
    const validNetlifyApiKey = process.env.Netlify_API_KEY;

    if (queryApiKey && queryApiKey !== validNetlifyApiKey) {
      isExecuting = false;
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized Access" }),
      };
    }

    // Parse the body
    const { firstName, lastName, email_ } = JSON.parse(event.body);

    const brilliumApiKey = process.env.BRILLIUM_API_KEY;
    const redirectUrl = "https://instituteofsustainability.onlinetests.app/assess.aspx?aid=A0R9EDCMLJ4P&key=aZEzHUB95vdAuLH7";

    const payload = {
      AssessmentId: "A0R9EDCMLJ4P",
      FirstName: firstName,
      LastName: lastName,
      EmailAddress: email_,
    //   UserName: email,
    //   Password: "Temp123!",
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
