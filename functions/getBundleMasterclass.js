// getBundleMasterclass.js

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const bundleId = body.bundleId;

        if (!bundleId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId is required" })
            };
        }

        // ------------------------------------------------------
        // 1️⃣ GET BUNDLE DETAILS (PUBLIC API)
        // ------------------------------------------------------
        const bundleRes = await fetch(
            `https://api.thinkific.com/api/public/v1/bundles/${bundleId}`,
            {
                headers: {
                    "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                    "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
                    "Content-Type": "application/json"
                }
            }
        );

        const bundleData = await bundleRes.json();

        if (!bundleRes.ok) {
            console.error("Bundle Error:", bundleData);
            throw new Error(`Bundle fetch failed (${bundleRes.status})`);
        }

        // The bundle API gives PRODUCT IDs, not COURSE IDs.
        const productIds = bundleData.included_items
            ?.filter(item => item.type === "Product")
            .map(item => item.id) || [];

        if (productIds.length === 0) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ bundle: bundleData, courses: [] })
            };
        }

        // ------------------------------------------------------
        // 2️⃣ GET REAL COURSES FROM PRODUCT IDS
        // ------------------------------------------------------
        const productRequests = productIds.map(async (productId) => {
            const productRes = await fetch(
                `https://api.thinkific.com/api/public/v1/products/${productId}`,
                {
                    headers: {
                        "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
                        "Content-Type": "application/json"
                    }
                }
            );

            const productData = await productRes.json();

            if (!productRes.ok) {
                console.error(`Product ${productId} fetch failed`, productData);
                return null;
            }

            // Extract real course ID from product.resource.id
            const realCourseId = productData?.resource?.id;
            const productType = productData?.product_type;

            if (productType !== "course" || !realCourseId) {
                return null; // Skip items that aren't actual courses
            }

            // ------------------------------------------------------
            // 3️⃣ FETCH REAL COURSE DETAILS
            // ------------------------------------------------------
            const courseRes = await fetch(
                `https://api.thinkific.com/api/public/v1/courses/${realCourseId}`,
                {
                    headers: {
                        "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN,
                        "Content-Type": "application/json"
                    }
                }
            );

            const courseData = await courseRes.json();

            if (!courseRes.ok) {
                console.error(`Course ${realCourseId} fetch failed`, courseData);
                return null;
            }

            return courseData;
        });

        const resolvedCourses = await Promise.all(productRequests);

        // Filter out null responses
        const courses = resolvedCourses.filter(Boolean);

        // ------------------------------------------------------
        // 4️⃣ RETURN FINAL RESULT
        // ------------------------------------------------------
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: bundleData,
                courses
            })
        };

    } catch (error) {
        console.error("Server Error:", error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};
