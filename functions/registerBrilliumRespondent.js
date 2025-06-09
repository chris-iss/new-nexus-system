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
      body: JSON.stringify({ error: "Missing student info" }),
    };
  }

  try {
    const response = await fetch("https://instituteofsustainability.onlinetests.app/api/Invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.BRILLIUM_API_KEY}`, // Make sure this is set in Netlify
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Invitations: [
          {
            AssessId: "A0R9EDCMLJ4P",
            FirstName: firstName,
            LastName: lastName,
            Email: email
          }
        ],
        SendEmails: false
      })
    });

    const result = await response.json();

    if (
      result?.Invitations?.[0]?.Code
    ) {
      const code = result.Invitations[0].Code;
      const redirectUrl = `https://instituteofsustainability.onlinetests.app/assess.aspx?aid=A0R9EDCMLJ4P&key=${code}`;

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
        },
        body: JSON.stringify({ redirectUrl })
      };
    } else {
      console.error("No invitation code returned:", result);
      return {
        statusCode: 502,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
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
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
