const fetch = require("node-fetch");

let isExecuting = false;

exports.handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "Preflight OK",
    };
  }

  if (isExecuting) {
    return {
      statusCode: 409,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Function is already executing" }),
    };
  }

  isExecuting = true;

  try {
    const { firstName, lastName, email_ } = JSON.parse(event.body);

    console.log("DATA-1", firstName)
    console.log("DATA-2", lastName)
    console.log("DATA-3", email_)

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

    const text = await response.text();

    if (!response.ok) {
      console.error("Brillium error:", text);
      throw new Error(`Brillium API error: ${response.statusText}`);
    }

    console.log("Brillium success:", text);

    isExecuting = false;
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Success", redirectUrl }),
    };

  } catch (error) {
    console.error("Server error:", error.message);
    isExecuting = false;
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: error.message }),
    };
  }
};
