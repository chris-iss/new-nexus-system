export async function handler(event, context) {
    try {
      const { email } = JSON.parse(event.body);
  
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
        body: JSON.stringify(data),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err.message }),
      };
    }
  }
  