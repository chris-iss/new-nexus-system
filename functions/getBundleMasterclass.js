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
        const bundleId = body.bundleId;

        if (!bundleId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId is required" })
            };
        }

        console.log("➡ Fetching Bundle:", bundleId);

        // ---------------------------------------------------
        // 1️⃣ PAGINATE BUNDLE PAGES UNTIL NOTHING LEFT
        // ---------------------------------------------------
        let page = 1;
        let allBundlePages = [];
        let hasMore = true;

        while (hasMore) {
            console.log(`📄 Fetching bundle page ${page}...`);

            const res = await fetch(
                `https://api.thinkific.com/api/public/v1/bundles/${bundleId}?page=${page}&limit=25`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                    }
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.log("❌ Thinkific error:", data);
                return {
                    statusCode: res.status,
                    headers: corsHeaders,
                    body: JSON.stringify(data)
                };
            }

            // Push current page
            allBundlePages.push(data);

            console.log(`📦 Bundle page returned:`, data?.included_items?.length || 0);

            // STOP when fewer than 25 items OR no included_items
            hasMore =
                data.included_items &&
                Array.isArray(data.included_items) &&
                data.included_items.length === 25;

            page++;
        }

        // ---------------------------------------------------
        // 2️⃣ MERGE ALL BUNDLE DATA INTO ONE OBJECT
        // ---------------------------------------------------
        const mergedBundle = { ...allBundlePages[0] };

        mergedBundle.included_items = allBundlePages.flatMap(
            p => p.included_items || []
        );

        // Prefer direct course_ids (faster, always present)
        const courseIds = mergedBundle.course_ids || [];

        console.log("📌 FINAL COURSE IDS:", courseIds);

        if (courseIds.length === 0) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    bundle: mergedBundle,
                    courses: []
                })
            };
        }

        // ---------------------------------------------------
        // 3️⃣ FETCH EACH COURSE DETAILS FROM COURSE IDS
        // ---------------------------------------------------
        const courseRequests = courseIds.map(async (id) => {
            console.log(`➡ Fetching Course ${id}`);

            const courseRes = await fetch(
                `https://api.thinkific.com/api/public/v1/courses/${id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
                    }
                }
            );

            const json = await courseRes.json();

            if (!courseRes.ok) {
                console.log(`❌ Failed course ${id}`, json);
                return null;
            }

            console.log(`✔ COURSE ${id} RECEIVED`);
            return json;
        });

        const resolvedCourses = await Promise.all(courseRequests);
        const validCourses = resolvedCourses.filter(Boolean);

        // ---------------------------------------------------
        // 4️⃣ RETURN FINAL MERGED RESPONSE
        // ---------------------------------------------------
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: mergedBundle,
                courses: validCourses
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
