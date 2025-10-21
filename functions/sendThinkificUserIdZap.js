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
        const extractPayload = data.results[0].properties


        //Update Main Thinkific UserId
        const contactId = data.results[0].id;

        if (!extractPayload.main_thinkific_user_id) {
            const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        properties: {
                            main_thinkific_user_id: extractedPayload.userId
                        }
                    }),
                }
            );

            const updateData = await updateResponse.json();
            console.log("UPDATED:", updateData);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message })
        };
    } finally {
        isExecuting = false;
    }
};
