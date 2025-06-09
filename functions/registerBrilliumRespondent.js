const fetch = require("node-fetch");

exports.handler = async (event) => {
  const allowedOrigin = "https://courses.instituteofsustainabilitystudies.com";

  // Handle CORS preflight
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

  // Parse request body
  const { firstName, lastName, email } = JSON.parse(event.body || "{}");

  if (!firstName || !lastName || !email) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Missing student info" }),
    };
  }

  try {
    // POST invitation to Brillium
    const brilliumResponse = await fetch("https://app.brillium.com/api/Invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.BRILLIUM_API_KEY}`, // ✅ Must be set in Netlify env vars
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Invitations: [
          {
            AssessId: "A0R9EDCMLJ4P", // ✅ Your actual assessment ID
            FirstName: firstName,
            LastName: lastName,
            Email: email
          }
        ],
        SendEmails: false
      })
    });

    const result = await brilliumResponse.json();

    if (
      result &&
      result.Invitations &&
      result.Invitations.length > 0 &&
      result.Invitations[0].Code
    ) {
      const invitationCode = result.Invitations[0].Code;

      const redirectUrl = `https://instituteofsustainability.onlinetests.app/assess.aspx?aid=A0R9EDCMLJ4P&key=${invitationCode}`;

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ redirectUrl })
      };
    } else {
      console.error("Brillium invitation response did not contain a code", result);
      return {
        statusCode: 502,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "No invitation code returned by Brillium" })
      };
    }
  } catch (error) {
    console.error("Error during Brillium registration:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
