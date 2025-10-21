const fetch = require("node-fetch");
require("dotenv").config();

let isExecuting = false;

// This codebase receives survey lesson completion on real-time and updates hubspot propeerty to trigger Cert generation
exports.handler = async (event) => {
    try {
        // Check if the function is already executing
        if (isExecuting) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: "Function is already executing" })
            };
        }
      
        isExecuting = true;

        const extractParameteres = JSON.parse(event.body);
        const extractedPayload = {
            userId: extractParameteres.payload.id,
            email: extractParameteres.payload.email
        }

    

        const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
            method: "POST",
            headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            filterGroups: [
                {
                filters: [
                    {
                    propertyName: "email",
                    operator: "EQ",
                    value: extractedPayload.email.trim(),
                    },
                ],
                },
            ],
            properties: ["email", "firstname", "lastname", "main_thinkific_user_id"],
            limit: 1,
            }),
        });
  
       const data = await response.json();

       console.log("PAYLOAD:", data)

        //  const sendResponseToZapier = await fetch('https://hooks.zapier.com/hooks/catch/14129819/2u3ts5t/', {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({ id: response.id, updatedProperty: contactPropertyToUpdate, firstname: getUser?.first_name, lastname: getUser?.last_name, email: getUser?.email, lessonCompleted: extractParameteres?.payload?.lesson?.name})
        // });
           
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" })
        };
    } catch(error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message })
        };
    } finally {
        isExecuting = false;
    }
};
