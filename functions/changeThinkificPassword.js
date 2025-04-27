import fetch from 'node-fetch';

exports.handler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",  // <--- ADD THIS
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "POST, OPTIONS"
                },
                body: JSON.stringify({ message: "Request body is missing." })
            };
        }

        const parsedBody = JSON.parse(event.body);
        const { userId, newPassword } = parsedBody;

        if (!userId || !newPassword) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "POST, OPTIONS"
                },
                body: JSON.stringify({ message: "Missing required fields." })
            };
        }

        const THINKIFIC_API_KEY = process.env.THINKIFIC_API_KEY;
        const THINKIFIC_SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        const updateResponse = await fetch(`https://${THINKIFIC_SUBDOMAIN}.thinkific.com/api/public/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${THINKIFIC_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: newPassword,
                password_confirmation: newPassword
            })
        });

        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
            return {
                statusCode: updateResponse.status,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "POST, OPTIONS"
                },
                body: JSON.stringify({ message: updateData.error || "Failed to update password." })
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",   // <--- ADD THIS IN ALL RETURNS
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: JSON.stringify({ message: "Password updated successfully." })
        };
    } catch (err) {
        console.error("Server error:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: JSON.stringify({ message: "Server error occurred." })
        };
    }
};
