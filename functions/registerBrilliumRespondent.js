const fetch = require("node-fetch");

exports.handler = async (event) => {
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

  const { firstName, lastName, email } = JSON.parse(event.body || "{}");

  if (!firstName || !lastName || !email) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: "Missing required fields" }),
    };
  }

  const payload = {
    AssessmentId: "A0R9EDCMLJ4P",
    FirstName: firstName,
    LastName: lastName,
    EmailAddress: email,
    RedirectUrl: "https://instituteofsustainability.onlinetests.app/assess.aspx?aid=A0R9EDCMLJ4P&key=aZEzHUB95vdAuLH7"
  };

  console.log("DATA:", payload)

  const apiNamespace = "ASSESSMENTS-API";
  const apiPassword = process.env.BRILLIUM_API_PASSWORD;
  const auth = Buffer.from(`${apiNamespace}:${apiPassword}`).toString("base64");

  try {
    const response = await fetch("https://instituteofsustainability.onlinetests.app/api/respondents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Brillium API error: ${err}`);
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({
        message: "Success",
        redirectUrl: payload.RedirectUrl
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: error.message })
    };
  }
};
