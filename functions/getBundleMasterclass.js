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
        console.log("➡ Incoming Event Body:", event.body);

        const body = JSON.parse(event.body || "{}");
        const bundleId = body.bundleId;

        if (!bundleId) {
            console.log("❌ No bundleId provided");
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId is required" })
            };
        }

        console.log("🔍 Fetching bundle:", bundleId);

        // ------------------------------
        // 1️⃣ FETCH BUNDLE
        // ------------------------------
        const bundleRes = await fetch(
            `https://api.thinkific.com/api/public/v1/bundles/${bundleId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                    "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                }
            }
        );

        const bundleData = await bundleRes.json();
        console.log("📦 BUNDLE RESPONSE:", JSON.stringify(bundleData, null, 2));

        if (!bundleRes.ok) {
            console.log("❌ Bundle fetch failed with status:", bundleRes.status);
            return {
                statusCode: bundleRes.status,
                headers: corsHeaders,
                body: JSON.stringify(bundleData)
            };
        }

        // Extract PRODUCT IDs
        const productIds = bundleData.included_items
            ?.filter(item => item.type === "Product")
            .map(item => item.id) || [];

        console.log("📦 PRODUCT IDS FOUND:", productIds);

        if (productIds.length === 0) {
            console.log("⚠ Bundle has NO productIds mapped.");
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ bundle: bundleData, courses: [] })
            };
        }

        // ------------------------------
        // 2️⃣ FOR EACH PRODUCT → GET REAL COURSE ID
        // ------------------------------
        const productRequests = productIds.map(async (productId) => {
            console.log(`🔍 Fetching PRODUCT ${productId}...`);

            const productRes = await fetch(
                `https://api.thinkific.com/api/public/v1/products/${productId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                    }
                }
            );

            const productData = await productRes.json();
            console.log(`📦 PRODUCT ${productId} RESPONSE:`, JSON.stringify(productData, null, 2));

            if (!productRes.ok) {
                console.log(`❌ Product ${productId} failed:`, productData);
                return null;
            }

            // Extract REAL course ID
            const realCourseId = productData?.resource?.id;
            const productType = productData.product_type;

            console.log(`📌 PRODUCT ${productId} TYPE:`, productType);
            console.log(`🎯 REAL COURSE ID for PRODUCT ${productId}:`, realCourseId);

            if (productType !== "course" || !realCourseId) {
                console.log(`⚠ Skipping product ${productId} — not a course.`);
                return null;
            }

            // ------------------------------
            // 3️⃣ GET REAL COURSE DETAILS
            // ------------------------------
            console.log(`🔍 Fetching REAL COURSE ${realCourseId}...`);

            const courseRes = await fetch(
                `https://api.thinkific.com/api/public/v1/courses/${realCourseId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                    }
                }
            );

            const courseData = await courseRes.json();
            console.log(`📘 COURSE ${realCourseId} RESPONSE:`, JSON.stringify(courseData, null, 2));

            if (!courseRes.ok) {
                console.log(`❌ Course ${realCourseId} fetch FAILED`, courseData);
                return null;
            }

            return courseData;
        });

        const resolvedCourses = await Promise.all(productRequests);
        const courses = resolvedCourses.filter(Boolean);

        console.log("🎉 FINAL COURSE LIST:", JSON.stringify(courses, null, 2));

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: bundleData,
                courses
            })
        };

    } catch (error) {
        console.error("💥 SERVER ERROR:", error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
