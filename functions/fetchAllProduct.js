const fetch = require("node-fetch");

exports.handler = async () => {
    try {
        const { THINKIFIC_API_KEY, THINKIFIC_SUB_DOMAIN } = process.env;

        let allProducts = [];
        let page = 1;
        let totalCollected = 0;

        console.log("🚀 Starting full product pagination...");

        while (true) {
            console.log(`📄 Fetching page ${page}...`);

            const res = await fetch(
                `https://api.thinkific.com/api/public/v1/products?page=${page}&limit=25`,
                {
                    headers: {
                        "X-Auth-API-Key": THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
                    }
                }
            );

            if (!res.ok) {
                throw new Error(`❌ Thinkific API error: ${res.status}`);
            }

            const data = await res.json();
            const items = data.items || [];

            console.log(`📦 Received ${items.length} items (Total so far: ${totalCollected + items.length})`);

            // Stop when Thinkific returns an empty page
            if (items.length === 0) {
                console.log("⛔ No more pages. Pagination complete.");
                break;
            }

            allProducts.push(...items);
            totalCollected += items.length;

            page++; // Move to next page
        }

        console.log(`✅ Finished fetching all products! Total collected: ${allProducts.length}`);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ items: allProducts })
        };

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
