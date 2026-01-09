

const fetch = require("node-fetch");

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { bundleId, userId, userExpiry } = body;

        if (!bundleId || !userId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId and userId are required" })
            };
        }

        console.log("➡ Running for user", userId, "bundle", bundleId);
        console.log("➡ Received expiry from FE:", userExpiry);

        const API_KEY = process.env.THINKIFIC_API_KEY;
        const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        // ---------------------------------------------------
        // 1️⃣ Fetch the Bundle (Pagination)
        // ---------------------------------------------------
        let page = 1;
        let allBundlePages = [];
        let hasMore = true;

        while (hasMore) {
            const res = await fetch(
                `https://api.thinkific.com/api/public/v1/bundles/${bundleId}?page=${page}&limit=25`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": API_KEY,
                        "X-Auth-Subdomain": SUBDOMAIN
                    }
                }
            );

            const data = await res.json();
            if (!res.ok) {
                return {
                    statusCode: res.status,
                    headers: corsHeaders,
                    body: JSON.stringify(data)
                };
            }

            allBundlePages.push(data);
            hasMore = Array.isArray(data.included_items) && data.included_items.length === 25;
            page++;
        }

        // Merge bundle pages
        const mergedBundle = { ...allBundlePages[0] };
        mergedBundle.included_items = allBundlePages.flatMap(p => p.included_items || []);
        const courseIds = mergedBundle.course_ids || [];

        console.log("📌 Bundle Course IDs:", courseIds);

        // ---------------------------------------------------
        // 2️⃣ Fetch User Enrollments
        // ---------------------------------------------------
        const enrollmentsRes = await fetch(
            `https://api.thinkific.com/api/public/v1/enrollments?user_id=${userId}&limit=200`,
            {
                headers: {
                    "X-Auth-API-Key": API_KEY,
                    "X-Auth-Subdomain": SUBDOMAIN
                }
            }
        );

        const enrollmentJson = await enrollmentsRes.json();
        const userEnrollments = Array.isArray(enrollmentJson.items) ? enrollmentJson.items : [];

        console.log("📌 Total user enrollments:", userEnrollments.length);

        // ---------------------------------------------------
        // 3️⃣ Use expiry date from frontend
        // ---------------------------------------------------
        const userMainExpiryDate = userExpiry ? new Date(userExpiry) : null;

        console.log("📅 FINAL MEMBERSHIP EXPIRY USED:", userMainExpiryDate);

        if (!userMainExpiryDate) {
            console.log("❌ No valid membership expiry found. Skipping auto-enroll.");
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    bundle: mergedBundle,
                    autoEnroll: "User inactive — no valid expiry.",
                    autoEnrollResults: []
                })
            };
        }

        // ---------------------------------------------------
        // 4️⃣ Determine which courses need enrolling
        // ---------------------------------------------------
        const alreadyEnrolledIds = userEnrollments
            .filter(e => e.expired === false)
            .map(e => e.course_id);

        const newCoursesToEnroll = courseIds.filter(id => !alreadyEnrolledIds.includes(id));

        console.log("🆕 New courses for auto-enroll:", newCoursesToEnroll);

        // ---------------------------------------------------
        // 5️⃣ Auto-enroll + fetch full course details
        // ---------------------------------------------------
        let enrollmentResults = [];

        for (const courseId of newCoursesToEnroll) {
            // 🔹 5a: Enroll the user
            const enrollRes = await fetch(
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
                        activated_at: new Date().toISOString(),
                        expiry_date: userMainExpiryDate.toISOString()
                    })
                }
            );

            const enrollJson = await enrollRes.json();

            console.log("ENROLLED USER:", enrollJson)

            // 🔹 5b: Fetch REAL course info for card display
            const courseRes = await fetch(
                `https://api.thinkific.com/api/public/v1/courses/${courseId}`,
                {
                    headers: {
                        "X-Auth-API-Key": API_KEY,
                        "X-Auth-Subdomain": SUBDOMAIN
                    }
                }
            );

            const courseJson = await courseRes.json();

            // 🔹 5c: Build final data block for frontend
            enrollmentResults.push({
                courseId,
                success: enrollRes.ok,
                enrollmentResponse: enrollJson,
                course: {
                    id: courseJson.id,
                    name: courseJson.name,
                    slug: courseJson.slug,
                    course_card_image_url: courseJson.course_card_image_url,
                    percentage_completed: enrollJson.percentage_completed ?? 0
                }
            });
        }

        // ---------------------------------------------------
        // 6️⃣ Return Full Response
        // ---------------------------------------------------
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: mergedBundle,
                autoEnrollResults: enrollmentResults,
                appliedExpiryDate: userMainExpiryDate.toISOString()
            })
        };

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};

