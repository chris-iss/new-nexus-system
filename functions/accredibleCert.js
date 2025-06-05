const fetch = require("node-fetch");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "Preflight OK",
    };
  }

  try {
    const { firstName, lastName, email } = JSON.parse(event.body || "{}");

    if (!firstName || !lastName || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const payload = {
      FirstName: firstName,
      LastName: lastName,
      EmailAddress: email,
    };

    console.log("DATA:", payload);

    // You can uncomment and customize your API call here if needed
    // const response = await fetch(...)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Success",
        redirectUrl: "https://example.com/certificate", // if needed
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
