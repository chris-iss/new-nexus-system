const fetch = require("node-fetch");
require("dotenv").config();

let isExecuting = false;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  if (isExecuting) {
    return {
      statusCode: 409,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Function is already executing" }),
    };
  }

  isExecuting = true;

  try {
    const requestBody = JSON.parse(event.body || "{}");
    const status = requestBody.action;
    const payload = requestBody.payload;

    if (!payload || !status) {
      isExecuting = false;
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const payloads = {
      payload,
      status
    };

    console.log("DATA:", payload)

    // await fetch("https://hooks.zapier.com/hooks/catch/14129819/2vgev9d/", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payloads),
    // });

    isExecuting = false;
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Success" }),
    };

  } catch (error) {
    console.error("Error:", error.message);
    isExecuting = false;
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
