const fetch = require("node-fetch");

exports.handler = async (event) => {
  const allowedOrigin = "https://courses.instituteofsustainabilitystudies.com";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
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
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ message: "Missing student info" }),
    };
  }

  try {
    const response = await fetch("https://app.brillium.com/api/invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.BRILLIUM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        AssessmentId: "A0R9EDCMLJ4P",  // Replace with your real Assessment ID
        FirstName: firstName,
        LastName: lastName,
        EmailAddress: email,
        Language: "en-US"
      })
    });

    const result = await response.json();

    if (result?.InvitationLink) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
        },
        body: JSON.stringify({ link: result.InvitationLink })
      };
    } else {
      throw new Error("No invitation link returned");
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
