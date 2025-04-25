const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const os = require("os");

exports.handler = async (event, context) => {
  // Enable CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "Preflight OK",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    const boundary = contentType.split("boundary=")[1];
    const bodyBuffer = Buffer.from(event.body, "base64");

    const parts = bodyBuffer
      .toString()
      .split(`--${boundary}`)
      .filter((part) => part.includes("name=") && part.trim() !== "--");

    const fields = {};
    let fileBuffer = null;
    let fileName = "";

    for (const part of parts) {
      const matchName = part.match(/name="([^"]+)"/);
      const name = matchName && matchName[1];

      if (part.includes("filename=")) {
        const fileMatch = part.match(/filename="([^"]+)"/);
        fileName = fileMatch && fileMatch[1];
        const fileContent = part.split("\r\n\r\n")[1];
        fileBuffer = Buffer.from(fileContent.trim(), "binary");
      } else {
        const value = part.split("\r\n\r\n")[1]?.trim();
        if (name) fields[name] = value;
      }
    }

    const { firstName, lastName, email, phone, userId } = fields;
    let avatar_url = "";

    if (fileBuffer && fileName) {
      const WP_BASE_URL = process.env.WP_BASE_URL;
      const WP_USERNAME = process.env.WP_USERNAME;
      const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

      const tmpFilePath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(tmpFilePath, fileBuffer);

      const formData = new FormData();
      formData.append("file", fs.createReadStream(tmpFilePath), fileName);

      const wpRes = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/media`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString("base64")}`,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      const wpData = await wpRes.json();
      if (!wpRes.ok) {
        return {
          statusCode: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ error: wpData.message || "WordPress upload failed" }),
        };
      }

      avatar_url = wpData.source_url;
    }

    const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
    const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

    const updateData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone,
    };

    if (avatar_url) updateData.avatar_url = avatar_url;

    const thinkificRes = await fetch(`https://api.thinkific.com/api/public/v1/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-API-Key": THINKIFIC_API_KEY,
        "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN,
      },
      body: JSON.stringify(updateData),
    });

    const thinkificData = await thinkificRes.json();

    if (!thinkificRes.ok) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: thinkificData.message || "Thinkific update failed" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Profile updated successfully", avatar_url }),
    };
  } catch (error) {
    console.error("Update failed:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message || "Server error" }),
    };
  }
};
