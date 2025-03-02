const fetch = require("node-fetch");

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            body: ""
        };
    }

    const { THINKIFIC_API_KEY, THINKIFIC_SUB_DOMAIN } = process.env;

    const GRAPHQL_ENDPOINT = "https://yourgraphqlapi.com/graphql"; // Replace with actual GraphQL API

    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${THINKIFIC_API_KEY}`
            },
            body: event.body
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Open CORS
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error fetching GraphQL data" })
        };
    }
};
