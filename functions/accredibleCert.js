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
    FirstName: firstName,
    LastName: lastName,
    EmailAddress: email,
  };

  



  try {
    console.log("DATA:", payload)
    // const response = await fetch("https://instituteofsustainability.onlinetests.app/api/respondents", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Basic ${auth}`
    //   },
    //   body: JSON.stringify(payload)
    // });

    // if (!response.ok) {
    //   const err = await response.text();
    //   throw new Error(`Brillium API error: ${err}`);
    // }

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
