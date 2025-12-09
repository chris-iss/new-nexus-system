const fetch = require("node-fetch");
exports.handler = async (event) => {
    try {
        const { THINKIFIC_API_KEY, THINKIFIC_SUB_DOMAIN } = process.env;
        const response = await fetch(`https://api.thinkific.com/api/public/v1/products`, {
            headers: {
                "X-Auth-API-Key": THINKIFIC_API_KEY,
                "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN
            }
        });
        const data = await response.json();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow all domains (adjust if needed)
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Ensure CORS headers are present in errors too
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ error: "Failed to fetch course", details: error.message })
        };
    }
};


// const fetch = require("node-fetch");

// exports.handler = async () => {
//     try {
//         const { THINKIFIC_API_KEY, THINKIFIC_SUB_DOMAIN } = process.env;

//         console.log("🔑 Using Thinkific Key:", THINKIFIC_API_KEY ? "Loaded" : "Missing");
//         console.log("🏫 Subdomain:", THINKIFIC_SUB_DOMAIN);

//         const headers = {
//             "X-Auth-API-Key": THINKIFIC_API_KEY,
//             "X-Auth-Subdomain": THINKIFIC_SUB_DOMAIN,
//             "Content-Type": "application/json"
//         };

//         let allProducts = [];
//         let page = 1;
//         let totalPages = 1;

//         console.log("🚀 Starting Thinkific products fetch...");

//         // Fetch all pages
//         do {
//             console.log(`📄 Fetching page ${page}...`);

//             const res = await fetch(
//                 `https://api.thinkific.com/api/public/v1/products?page=${page}`,
//                 { headers }
//             );

//             if (!res.ok) {
//                 const txt = await res.text();
//                 console.error("❌ Error Response:", txt);
//                 throw new Error(`Failed to fetch products: ${res.status}`);
//             }

//             const json = await res.json();

//             console.log(`📦 Page ${page} returned ${json.items.length} items`);

//             allProducts = [...allProducts, ...json.items];

//             totalPages = json.total_pages;
//             console.log(`📊 Total Pages: ${totalPages}`);

//             page++;

//         } while (page <= totalPages);

//         console.log("✅ Finished fetching all products");
//         console.log(`🎉 Total Products Collected: ${allProducts.length}`);

//         return {
//             statusCode: 200,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type"
//             },
//             body: JSON.stringify(allProducts)
//         };

//     } catch (error) {
//         console.error("🔥 SERVER ERROR:", error.message);
//         return {
//             statusCode: 500,
//             headers: {
//                 "Access-Control-Allow-Origin": "*",
//                 "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//                 "Access-Control-Allow-Headers": "Content-Type"
//             },
//             body: JSON.stringify({
//                 error: "Failed to fetch products",
//                 details: error.message
//             })
//         };
//     }
// };









