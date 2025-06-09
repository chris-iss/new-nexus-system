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

  // Parse the incoming data
  const { firstName, lastName, email } = JSON.parse(event.body || "{}");

  console.log("DATA:", firstName, lastName, email);

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
    // Call Brillium Invitations API
    const response = await fetch("https://app.brillium.com/api/invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.BRILLIUM_API_KEY}`, // Ensure this is set in Netlify's env vars
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        AssessmentId: "A0R9EDCMLJ4P",  // ✅ Confirm this is your actual Brillium AssessmentId
        FirstName: firstName,
        LastName: lastName,
        EmailAddress: email,
        Language: "en-US"
      })
    });

    const result = await response.json();

    console.log("BRILLIUM-STATUS:", response.status);
    console.log("BRILLIUM-RESPONSE:", result);

    if (result?.InvitationLink) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
        },
        body: JSON.stringify({ redirectUrl: result.InvitationLink })
      };
    } else {
      throw new Error(result.Message || "No invitation link returned from Brillium.");
    }

  } catch (error) {
    console.error("ERROR-CALLING-BRILLIUM:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ error: error.message || "Internal Server Error" })
    };
  }
};
