import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SERVICE_KEY;

const supabase = createClient(supabase_url, supabase_service_key);

export async function handler(event) {
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

    if (avatar_url) {
      updateData.avatar_url = avatar_url;
    }

    // ✅ INSERT into Supabase
    const { data, error } = await supabase.from("profiles").insert([{
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      avatar_url: avatar_url || null,
    }]);

    if (error) {
      console.error("Error inserting into Supabase:", error);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Supabase insert failed", details: error.message }),
      };
    }

    console.log("Inserted into Supabase:", data);

    // ✅ Update Thinkific
    const thinkificRes = await fetch(`https://${THINKIFIC_SUBDOMAIN}.thinkific.com/api/public/v1/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-API-Key": THINKIFIC_API_KEY,
        "X-Auth-Subdomain": THINKIFIC_SUBDOMAIN,
      },
      body: JSON.stringify(updateData),
    });

    const responseText = await thinkificRes.text();
    let thinkificResult;

    try {
      thinkificResult = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.warn("Thinkific response was not valid JSON.");
      thinkificResult = { raw: responseText };
    }

    if (!thinkificRes.ok) {
      console.error("Thinkific update failed:", thinkificResult);
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
        message: "Profile updated successfully",
        avatar_url,
        thinkific: thinkificResult,
        supabase: data
      }),
    };

  } catch (err) {
    console.error("Server error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error", details: err.message }),
    };
  }
}
