const fetch = require("node-fetch");

exports.handler = async (event) => {
    const { THINKIFIC_API_KEY, THINKIFIC_SUB_DOMAIN } = process.env;

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
        console.log("⚡ Fetching ALL Thinkific products…");

        let allProducts = [];
        let page = 1;
        let totalPages = 1;

        // Loop until we reach the last page
        while (page <= totalPages) {
            console.log(`📄 Fetching page ${page} / ${totalPages}`);

            const res = await fetch(
                `https://api.thinkific.com/api/public/v1/products?page=${page}&limit=25`,
                {
                    headers: {
                        "X-Auth-API-Key": THINKIFIC_API_KEY,
                        "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN,
                    },
                }
            );

            const data = await res.json();

            if (!data.items) {
                console.error("❌ Invalid response:", data);
                break;
            }

            // Add items
            allProducts = [...allProducts, ...data.items];

            console.log("ALL PRODUCTS:", allProducts)

            // Update total pages (from API meta)
            totalPages = data.meta?.total_pages || 1;

            console.log(`📦 Received ${data.items.length} items (Total so far: ${allProducts.length})`);

            page++;
        }

        console.log(`✅ Finished. Total products collected: ${allProducts.length}`);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ items: allProducts }),
        };
    } catch (error) {
        console.error("❌ ERROR fetching products:", error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: "Failed to fetch courses",
                details: error.message,
            }),
        };
    }
};










