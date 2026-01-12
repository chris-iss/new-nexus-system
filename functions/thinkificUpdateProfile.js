
import fetch from 'node-fetch'; // Use native fetch if available

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "OK",
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { userId, firstName, lastName, email, phone, avatar_url } = body;

    if (!userId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing user ID" }),
      };
    }

    const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
    const THINKIFIC_SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

    if (!THINKIFIC_API_KEY || !THINKIFIC_SUBDOMAIN) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing Thinkific credentials in environment variables" }),
      };
    }

    const updateData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phone,
    };

    console.log("DATA", updateData)

    if (avatar_url) {
      updateData.avatar_url = avatar_url;
    }

    // Save data to thinkific
    const thinkificRes = await fetch(`https://${THINKIFIC_SUBDOMAIN}.thinkific.com/api/public/v1/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-API-Key": THINKIFIC_API_KEY,
        "X-Auth-Subdomain": THINKIFIC_SUBDOMAIN,
      },
      body: JSON.stringify(updateData),
    });

    // Safely parse the response
    const responseText = await thinkificRes.text();
    let thinkificResult = null;

    try {
      thinkificResult = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.warn("Thinkific response could not be parsed as JSON.");
      thinkificResult = { raw: responseText };
    }

    if (!thinkificRes.ok) {
      console.error("Thinkific Error:", thinkificResult);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Failed to update Thinkific", details: thinkificResult }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Profile updated successfully!",
        updated_user: thinkificResult || { userId, ...updateData }
      }),
    };

  } catch (err) {
    console.error("Server error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}



