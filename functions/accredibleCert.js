const fetch = require("node-fetch");

exports.handler = async (event) => {
  console.log("=== accredibleCert invoked ===");
  console.log("HTTP Method:", event.httpMethod);
  console.log("Headers:", event.headers);
  console.log("Raw body:", event.body);

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    console.log("CORS preflight request");
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

  let parsedBody = {};
  try {
    parsedBody = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("❌ JSON parse error:", err.message);
  }

  console.log("Parsed body:", parsedBody);

  const { firstName, lastName, email } = parsedBody;

  console.log("Extracted fields:", {
    firstName,
    lastName,
    email,
  });

  if (!firstName || !lastName || !email) {
    console.warn("❌ Missing required fields");
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({
        message: "Missing required fields",
        received: { firstName, lastName, email },
        rawBody: event.body,
      }),
    };
  }

  const payload = {
    FirstName: firstName,
    LastName: lastName,
    EmailAddress: email,
  };

  console.log("Payload for HubSpot search:", payload);

  try {
    const hubspotBaseURL = "https://api.hubapi.com/crm/v3/objects/contacts/search";

    const hubspotSearchProperties = {
      filterGroups: [
        {
          filters: [
            { operator: "EQ", propertyName: "email", value: payload.EmailAddress },
          ],
        },
        {
          filters: [
            { operator: "EQ", propertyName: "hs_additional_emails", value: payload.EmailAddress },
          ],
        },
      ],
      limit: 1,
      properties: [
        "id",
        "email",
        "bs_diploma___credential_link",
        "diploma___final_score____",
        "paid_in_full",
        "credential_issue_date",
        "csrd_crendetial_issue_date",
      ],
      sorts: [{ propertyName: "lastmodifieddate", direction: "ASCENDING" }],
    };

    console.log("Sending HubSpot search request…");

    const searchContact = await fetch(hubspotBaseURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_OAUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hubspotSearchProperties),
    });

    console.log("HubSpot response status:", searchContact.status);

    const hubspotContactResponse = await searchContact.json();
    console.log("HubSpot response body:", hubspotContactResponse);

    if (!hubspotContactResponse.results || hubspotContactResponse.results.length === 0) {
      console.warn("❌ No contact found in HubSpot");
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        },
        body: JSON.stringify({ message: "No contact found in HubSpot." }),
      };
    }

    const hubspotContactData = hubspotContactResponse.results[0].properties;
    console.log("✅ Contact found:", hubspotContactData.email);

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
    console.error("🔥 HubSpot Search Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: error.message }),
    };
  }
};
