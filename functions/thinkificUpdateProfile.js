const fetch = require("node-fetch");
const FormData = require("form-data");
const formidable = require("formidable");

exports.handler = async (event, context) => {
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
    const form = new formidable.IncomingForm({ multiples: true });
    const formParse = () =>
      new Promise((resolve, reject) => {
        form.parse(event, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

    const { fields, files } = await formParse();

    const { firstName, lastName, email, phone, userId } = fields;
    let avatar_url = "";

    if (files.file) {
      const WP_BASE_URL = process.env.WP_BASE_URL;
      const WP_USERNAME = process.env.WP_USERNAME;
      const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

      const formData = new FormData();
      formData.append("file", fs.createReadStream(files.file.path), files.file.name);

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

    console.log("UPDATE-DATA", updateData);
console.log("THINKIFIC API URL", `https://api.thinkific.com/api/public/v1/users/${userId}`);
console.log("HEADERS", {
  "Content-Type": "application/json",
  "X-Auth-API-Key": THINKIFIC_API_KEY,
  "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN,
});

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

    const thinkificText = await thinkificRes.text();
    let thinkificData;
    try {
      thinkificData = JSON.parse(thinkificText);
    } catch (err) {
      thinkificData = null;
    }

    if (!thinkificRes.ok) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: thinkificData?.message || "Thinkific update failed" }),
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
