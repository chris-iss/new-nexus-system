const fetch = require("node-fetch");

exports.handler = async (event) => {
  // Handle CORS preflight
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
    const hubspotBaseURL = `https://api.hubapi.com/crm/v3/objects/contacts/search`;

    const hubspotSearchProperties = {
      after: "0",
      filterGroups: [
        { filters: [{ operator: "EQ", propertyName: "email", value: payload.EmailAddress }] },
        { filters: [{ operator: "EQ", propertyName: "hs_additional_emails", value: payload.EmailAddress }] },
      ],
      limit: 1,
      properties: [
        "email",
        "bs_diploma___credential_link",
        "diploma___final_score____",
        "paid_in_full",
        "id"
      ],
      sorts: [{ propertyName: "lastmodifieddate", direction: "ASCENDING" }],
    };

    const searchContact = await fetch(hubspotBaseURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUBSPOT_OAUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hubspotSearchProperties),
    });

    const hubspotContactResponse = await searchContact.json();

    if (!hubspotContactResponse.results || hubspotContactResponse.results.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        },
        body: JSON.stringify({ message: "No contact found in HubSpot." }),
      };
    }

    const hubspotContactData = hubspotContactResponse.results[0].properties;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        message: "Success",
        contact: hubspotContactData,
      }),
    };

  } catch (error) {
    console.error("HubSpot Search Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: error.message }),
    };
  }
};
