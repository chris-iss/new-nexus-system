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

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Allow": "POST" },
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
    const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

    if (!THINKIFIC_API_KEY || !THINKIFIC_SUB_DOMAIN) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Missing API Key or Subdomain in environment variables" })
        };
    }

    const GRAPHQL_ENDPOINT = "https://api.thinkific.com/api/public/v1/graphql"; // ✅ Correct Endpoint

    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Auth-API-Key": THINKIFIC_API_KEY, // ✅ Correct API Key Header
                "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN // ✅ Correct Subdomain Header
            },
            body: event.body
        });

        const data = await response.json();
        console.log("Thinkific API Response:", data);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("GraphQL Fetch Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error fetching GraphQL data" })
        };
    }
};
