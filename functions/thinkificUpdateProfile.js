// const fetch = require("node-fetch");
// const FormData = require("form-data");

// exports.handler = async (event, context) => {
//   if (event.httpMethod === "OPTIONS") {
//     return {
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//       },
//       body: "Preflight OK",
//     };
//   }

//   if (event.httpMethod !== "POST") {
//     return {
//       statusCode: 405,
//       headers: { "Access-Control-Allow-Origin": "*" },
//       body: JSON.stringify({ error: "Method not allowed" }),
//     };
//   }

//   try {
//     const contentType = event.headers["content-type"] || event.headers["Content-Type"];

//     if (!contentType.includes("multipart/form-data")) {
//       return {
//         statusCode: 400,
//         headers: { "Access-Control-Allow-Origin": "*" },
//         body: JSON.stringify({ error: "Invalid content type" }),
//       };
//     }

//     // Parse the form manually
//     const boundary = contentType.split("boundary=")[1];
//     const bodyBuffer = Buffer.from(event.body, "base64");
//     const parts = bodyBuffer
//       .toString()
//       .split(`--${boundary}`)
//       .filter((part) => part.includes("name=") && !part.includes("--"));

//     const fields = {};
//     let fileBuffer = null;
//     let fileName = "profile.jpg"; // default filename if none provided

//     for (const part of parts) {
//       const nameMatch = part.match(/name="([^"]+)"/);
//       const name = nameMatch && nameMatch[1];

//       if (part.includes("filename=")) {
//         const filenameMatch = part.match(/filename="([^"]+)"/);
//         if (filenameMatch) fileName = filenameMatch[1];

//         const fileContent = part.split("\r\n\r\n")[1];
//         fileBuffer = Buffer.from(fileContent.trim(), "binary");
//       } else {
//         const value = part.split("\r\n\r\n")[1]?.trim();
//         if (name) fields[name] = value;
//       }
//     }

//     const { firstName, lastName, email, phone, userId } = fields;
//     let avatar_url = "";

//     // ✅ Upload file to WordPress if file exists
//     if (fileBuffer) {
//       const WP_BASE_URL = process.env.WP_BASE_URL;
//       const WP_USERNAME = process.env.WP_USERNAME;
//       const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

//       const formData = new FormData();
//       formData.append("file", fileBuffer, {
//         filename: fileName,
//         contentType: "image/jpeg", // you can improve this later to detect file type
//       });

//       const wpRes = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/media`, {
//         method: "POST",
//         headers: {
//           Authorization: `Basic ${Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString("base64")}`,
//           ...formData.getHeaders(),
//         },
//         body: formData,
//       });

//       const wpData = await wpRes.json();
//       if (!wpRes.ok) {
//         return {
//           statusCode: 500,
//           headers: { "Access-Control-Allow-Origin": "*" },
//           body: JSON.stringify({ error: wpData.message || "WordPress upload failed" }),
//         };
//       }

//       avatar_url = wpData.source_url;
//     }

//     // ✅ Update Thinkific
//     const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
//     const THINKIFIC_SUB_DOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

//     const updateData = {
//       first_name: firstName,
//       last_name: lastName,
//       email,
//       phone_number: phone,
//     };

//     if (avatar_url) {
//       updateData.avatar_url = avatar_url;
//     }

//     const thinkificRes = await fetch(`https://api.thinkific.com/api/public/v1/users/${userId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Auth-API-Key": THINKIFIC_API_KEY,
//         "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN,
//       },
//       body: JSON.stringify(updateData),
//     });

//     const thinkificText = await thinkificRes.text();
//     let thinkificData;
//     try {
//       thinkificData = JSON.parse(thinkificText);
//     } catch {
//       thinkificData = null;
//     }

//     if (!thinkificRes.ok) {
//       return {
//         statusCode: 500,
//         headers: { "Access-Control-Allow-Origin": "*" },
//         body: JSON.stringify({ error: thinkificData?.message || "Thinkific update failed" }),
//       };
//     }

//     return {
//       statusCode: 200,
//       headers: { "Access-Control-Allow-Origin": "*" },
//       body: JSON.stringify({ message: "Profile updated successfully", avatar_url }),
//     };

//   } catch (error) {
//     console.error("Update failed:", error);
//     return {
//       statusCode: 500,
//       headers: { "Access-Control-Allow-Origin": "*" },
//       body: JSON.stringify({ error: error.message || "Server error" }),
//     };
//   }
// };

const fetch = require("node-fetch");
const formidable = require("formidable");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SERVICE_KEY;

const supabase = createClient(supabase_url, supabase_service_key);

exports.handler = async (event) => {
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

    const parseForm = () =>
      new Promise((resolve, reject) => {
        form.parse(event, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

    const { fields, files } = await parseForm();
    const { firstName, lastName, email, phone, userId } = fields;
    let avatar_url = "";

    if (files.file) {
      const fileBuffer = fs.readFileSync(files.file.path);
      const fileName = files.file.name;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(`avatars/${Date.now()}_${fileName}`, fileBuffer, {
          contentType: files.file.type,
          upsert: true,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);

      avatar_url = publicData.publicUrl;  // ← Correct way
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

    const thinkificRes = await fetch(
      `https://api.thinkific.com/api/public/v1/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-API-Key": THINKIFIC_API_KEY,
          "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!thinkificRes.ok) {
      const errorText = await thinkificRes.text();
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Thinkific update failed", details: errorText }),
      };
    }

    // ✅ Insert into Supabase Database
    const { error: supabaseError } = await supabase
      .from("profiles") // <<< make sure "profiles" matches your Supabase table name exactly
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          avatar_url,
        },
      ]);

    if (supabaseError) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Supabase insert failed", details: supabaseError.message }),
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
