const multiparty = require("multiparty");
const fs = require("fs");
const fetch = require("node-fetch");
const FormData = require("form-data");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

exports.handler = async function (event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "Preflight OK",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const form = new multiparty.Form();

  return new Promise((resolve, reject) => {
    form.parse(event, async function (err, fields, files) {
      console.log("FIELDS DATA:", fields);
      console.log("FIELDS FILE:", files);

      if (err) {
        return resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Error parsing form" }),
        });
      }

      const firstName = fields.firstName?.[0];
      const lastName = fields.lastName?.[0];
      const email = fields.email?.[0];
      const phone = fields.phone?.[0];
      const userId = fields.userId?.[0];
      const file = files.file?.[0];

      let avatar_url = "";
      if (file) {
        try {
          const filePath = file.path;
          const fileName = file.originalFilename;
          const fileStream = fs.createReadStream(filePath);

          const WP_BASE_URL = process.env.WP_BASE_URL;
          const WP_USERNAME = process.env.WP_USERNAME;
          const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

          const formData = new FormData();
          formData.append("file", fileStream, fileName);

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
            return resolve({
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: wpData.message || "Failed to upload to WordPress" }),
            });
          }

          avatar_url = wpData.source_url;
        } catch (uploadErr) {
          return resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Image upload failed", details: uploadErr.message }),
          });
        }
      }

      try {
        const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
        const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        const updateData = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phone,
        };

        if (avatar_url) {
          updateData.avatar_url = avatar_url;
        }

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
          return resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: thinkificData.message || "Failed to update user" }),
          });
        }

        return resolve({
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "Profile updated", avatar_url }),
        });
      } catch (err) {
        return resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Thinkific update failed", details: err.message }),
        });
      }
    });
  });
};
