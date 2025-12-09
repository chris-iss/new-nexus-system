const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        const { userId, courseIds } = body;

        if (!userId || !Array.isArray(courseIds)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "userId and courseIds[] are required" })
            };
        }

        const API_KEY = process.env.THINKIFIC_API_KEY;
        const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        let results = [];

        for (const courseId of courseIds) {
            const res = await fetch(
                `https://api.thinkific.com/api/public/v1/enrollments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": API_KEY,
                        "X-Auth-Subdomain": SUBDOMAIN
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        course_id: courseId,
                        activated_at: new Date().toISOString()
                    })
                }
            );

            const data = await res.json();
            results.push({ courseId, success: res.ok, response: data });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Enrollment attempt completed",
                results
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
