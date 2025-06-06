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
        "id",
        "email",
        "bs_diploma___credential_link",
        "diploma___final_score____",
        "paid_in_full",

        "credential_issue_date",      
        "module_1_crendetial_issue_date",
        "module_2_crendetial_issue_date",
        "module_3_crendetial_issue_date",
        "module_4_crendetial_issue_date",
        "module_5_crendetial_issue_date",
        "module_6_crendetial_issue_date",
        "module_7_crendetial_issue_date",
        "module_8_crendetial_issue_date",
        "module_9_crendetial_issue_date",
        "module_10_crendetial_issue_date",
        "module_11_crendetial_issue_date",
        "module_12_crendetial_issue_date",
        "csrd_crendetial_issue_date",   
    
        "unbundled_module_1_credential_link",
        "unbundled_module_2_credential_link",
        "unbundled_module_3_credential_link",
        "unbundled_module_4_credential_link",
        "unbundled_module_5_credential_link",
        "unbundled_module_6_credential_link",
        "unbundled_module_7_credential_link",
        "unbundled_module_8_credential_link",
        "unbundled_module_9_credential_link",
        "unbundled_module_10_credential_link",
        "unbundled_module_11_credential_link",
        "unbundled_module_12_credential_link",
        "unbundled_csrd_credential_link",

        "unbundled_module_1",
        "unbundled_module_2",
        "unbundled_module_3",
        "unbundled_module_4",
        "unbundled_module_5",
        "unbundled_module_6",
        "unbundled_module_7",
        "unbundled_module_8",
        "unbundled_module_9",
        "unbundled_module_10",
        "unbundled_module_11",
        "unbundled_module_12",
        "unbundled_csrd",
    
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
