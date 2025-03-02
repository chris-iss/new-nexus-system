const fetch = require("node-fetch");

exports.handler = async (event) => {
    console.log("🔍 Incoming Request:", event.httpMethod);

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
        console.log("⛔ Method Not Allowed");
        return {
            statusCode: 405,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
    const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

    if (!THINKIFIC_API_KEY || !THINKIFIC_SUB_DOMAIN) {
        console.log("❌ Missing API Key or Subdomain");
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Missing API Key or Subdomain in environment variables" })
        };
    }

    const GRAPHQL_ENDPOINT = "https://api.thinkific.com/api/public/v1/graphql";

    console.log("🔗 Sending request to Thinkific API...");

    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Auth-API-Key": THINKIFIC_API_KEY,
                "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
            },
            body: event.body
        });

        console.log("🟢 Response Status:", response.status);

        const textResponse = await response.text(); // ✅ Get raw response
        console.log("📩 Thinkific Raw Response:", textResponse);

        // Check if the response is HTML (error page) instead of JSON
        if (textResponse.startsWith("<")) {
            console.error("❌ Received HTML instead of JSON. Possible API Key/Subdomain issue.");
            return {
                statusCode: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Invalid API response: Received HTML instead of JSON." })
            };
        }

        const data = JSON.parse(textResponse);

        if (!response.ok) {
            console.log("❌ API Error:", data);
            return {
                statusCode: response.status,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: data })
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("🔥 GraphQL Fetch Error:", error);

        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Error fetching GraphQL data", details: error.message })
        };
    }
};
