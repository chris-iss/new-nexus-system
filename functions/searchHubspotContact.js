export async function handler(event, context) {
    try {
      if (event.httpMethod === "OPTIONS") {
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
          },
          body: ""
        };
      }
  
      if (!event.body) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({ message: "Missing request body." }),
        };
      }
  
      const { email } = JSON.parse(event.body);

      console.log(email)
  
      if (!email || !email.trim()) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({ message: "Email is required." }),
        };
      }
  
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
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
                  value: email.trim(),
                },
              ],
            },
          ],
          properties: ["email", "firstname", "lastname"],
          limit: 1,
        }),
      });
  
      const data = await response.json();
  
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(data),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ message: err.message }),
      };
    }
  }
  