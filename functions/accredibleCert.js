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
    
    // Function to search for a HubSpot contact using Thinkific email
    const hubspotSearchContact = async () => {

      const hubspotBaseURL = `https://api.hubapi.com/crm/v3/objects/contacts/search`;

      try {
        // Define properties for searching HubSpot contacts by email
        const hubspotSearchProperties = {
          after: "0",
          filterGroups: [
            { filters: [{ operator: "EQ", propertyName: "email", value: payload.EmailAddress }] },
            { filters: [{ operator: "EQ", propertyName: "hs_additional_emails", value: payload.EmailAddress }] },
          ],
          limit: "100",
          properties: ["email", "bs_diploma___credential_link", "diploma___final_score____", "paid_in_full", "id"], // Include id for updating
          sorts: [{ propertyName: "lastmodifieddate", direction: "ASCENDING" }],
        };

        // Make a POST request to search for HubSpot contacts
        const searchContact = await fetch(`${hubspotBaseURL}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUBSPOT_OAUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hubspotSearchProperties),
        });

        const hubspotContactResponse = await searchContact.json();

        console.log("HUBSPOT SEARCH:", hubspotContactResponse.results.properties)

        // Return a success response
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Search was Successful",
          }),
        };
      } catch (error) {
        // Return an error response if the search encounters an issue
        return {
          statusCode: 422,
          body: JSON.stringify({
            message: error.message,
          }),
        };
      }
    };

    // Invoke the function to search for and update HubSpot contacts
    await hubspotSearchContact();

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
