export async function handler(event, context) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
  
    // Handle preflight CORS
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      };
    }
  
    try {
      if (!event.body) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Missing request body." }),
        };
      }
  
      const { email, properties } = JSON.parse(event.body);

      console.log(email, properties)
  
      if (!email) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Email is required." }),
        };
      }
  
      if (!properties || typeof properties !== "object") {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Properties object is required." }),
        };
      }
  
      // 1. Search contact
      const searchResponse = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: "email",
                    operator: "EQ",
                    value: email,
                  },
                ],
              },
            ],
            properties: ["email"],
            limit: 1,
          }),
        }
      );
  
      const searchData = await searchResponse.json();
  
      if (!searchData.results || searchData.results.length === 0) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Contact not found." }),
        };
      }
  
      const contactId = searchData.results[0].id;
  
      // 2. Update contact
      const updateResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties }),
        }
      );
  
      const updateData = await updateResponse.json();
  
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(updateData),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ message: err.message }),
      };
    }
  }
  