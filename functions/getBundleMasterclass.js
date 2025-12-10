

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
        const { bundleId, userId } = body;

        if (!bundleId || !userId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "bundleId and userId are required" })
            };
        }

        console.log("➡ Fetching Bundle:", bundleId);

        const API_KEY = process.env.THINKIFIC_API_KEY;
        const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

        // ---------------------------------------------------
        // 1️⃣ PAGINATE BUNDLE
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

            hasMore =
                data.included_items &&
                Array.isArray(data.included_items) &&
                data.included_items.length === 25;

            page++;
        }

        // ---------------------------------------------------
        // 2️⃣ MERGE BUNDLE DATA
        // ---------------------------------------------------
        const mergedBundle = { ...allBundlePages[0] };
        mergedBundle.included_items = allBundlePages.flatMap(p => p.included_items || []);

        const courseIds = mergedBundle.course_ids || [];
        console.log("📌 FINAL COURSE IDS:", courseIds);

        // ---------------------------------------------------
        // 3️⃣ FETCH COURSES DETAILS
        // ---------------------------------------------------
        const courseRequests = courseIds.map(async (id) => {
            const courseRes = await fetch(
                `https://api.thinkific.com/api/public/v1/courses/${id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-API-Key": API_KEY,
                        "X-Auth-Subdomain": SUBDOMAIN
                    }
                }
            );

            const json = await courseRes.json();
            return courseRes.ok ? json : null;
        });

        const resolvedCourses = await Promise.all(courseRequests);
        const validCourses = resolvedCourses.filter(Boolean);

        // ---------------------------------------------------
        // 4️⃣ GET USER ENROLLMENTS
        // ---------------------------------------------------
        console.log("➡ Fetching enrollments for user:", userId);

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
        const userEnrollments = enrollmentJson.items || [];

        // ---------------------------------------------------
        // 5️⃣ FIND USER EXPIRY DATE
        //    (uses any active course; if missing → generates +12 months)
        // ---------------------------------------------------
        const activeEnrollments = userEnrollments.filter(e => e.expired === false);

        let userMainExpiryDate = null;

        if (activeEnrollments.length > 0) {
            const expiryDates = activeEnrollments
                .map(e => e.expired_date ? new Date(e.expired_date) : null)
                .filter(Boolean);

            if (expiryDates.length > 0) {
                // Use the latest expiry available
                userMainExpiryDate = new Date(Math.max(...expiryDates));
            } else {
                // No expiry_date from Thinkific → default to + 12 months
                userMainExpiryDate = new Date();
                userMainExpiryDate.setFullYear(userMainExpiryDate.getFullYear() + 1);
            }
        }

        console.log("📅 Computed user expiry date:", userMainExpiryDate);

        // ---------------------------------------------------
        // 6️⃣ RULE: USER MUST HAVE ANY ACTIVE COURSE
        // ---------------------------------------------------
        if (!userMainExpiryDate) {
            console.log("❌ User has no active enrollment. Skipping auto-enroll.");
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    bundle: mergedBundle,
                    courses: validCourses,
                    autoEnroll: "User inactive — skipped"
                })
            };
        }

        // ---------------------------------------------------
        // 7️⃣ DETERMINE WHICH COURSES ARE NEW
        // ---------------------------------------------------
        const alreadyEnrolledIds = userEnrollments
            .filter(e => e.expired === false)
            .map(e => e.course_id);

        const newCoursesToEnroll = courseIds.filter(
            id => !alreadyEnrolledIds.includes(id)
        );

        console.log("🆕 New courses to auto-enroll:", newCoursesToEnroll);

        // ---------------------------------------------------
        // 8️⃣ AUTO-ENROLL USING USER'S EXPIRY DATE
        // ---------------------------------------------------
        let enrollmentResults = [];

        for (const courseId of newCoursesToEnroll) {
            console.log(`📌 Enrolling user ${userId} into course ${courseId}`);

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
                        activated_at: new Date().toISOString(),
                        expiry_date: userMainExpiryDate.toISOString()
                    })
                }
            );

            const json = await res.json();

            enrollmentResults.push({
                courseId,
                success: res.ok,
                response: json
            });
        }

        // ---------------------------------------------------
        // 9️⃣ RETURN EVERYTHING
        // ---------------------------------------------------
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                bundle: mergedBundle,
                courses: validCourses,
                autoEnrollResults: enrollmentResults,
                appliedExpiryDate: userMainExpiryDate
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


// const fetch = require("node-fetch");

// exports.handler = async (event) => {
//     const corsHeaders = {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//     };

//     if (event.httpMethod === "OPTIONS") {
//         return { statusCode: 200, headers: corsHeaders };
//     }

//     try {
//         const body = JSON.parse(event.body || "{}");
//         const { bundleId, userId, activePaidCourses } = body;

//         if (!bundleId || !userId) {
//             return {
//                 statusCode: 400,
//                 headers: corsHeaders,
//                 body: JSON.stringify({ error: "bundleId and userId are required" })
//             };
//         }

//         console.log("➡ Running for user", userId, "bundle", bundleId);
//         console.log("➡ Received activePaidCourses from FE:", activePaidCourses);

//         const API_KEY = process.env.THINKIFIC_API_KEY;
//         const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

//         // ---------------------------------------------------
//         // 1️⃣ Fetch the Bundle (Pagination)
//         // ---------------------------------------------------
//         let page = 1;
//         let allBundlePages = [];
//         let hasMore = true;

//         while (hasMore) {
//             const res = await fetch(
//                 `https://api.thinkific.com/api/public/v1/bundles/${bundleId}?page=${page}&limit=25`,
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         "X-Auth-API-Key": API_KEY,
//                         "X-Auth-Subdomain": SUBDOMAIN
//                     }
//                 }
//             );

//             const data = await res.json();
//             if (!res.ok) {
//                 return {
//                     statusCode: res.status,
//                     headers: corsHeaders,
//                     body: JSON.stringify(data)
//                 };
//             }

//             allBundlePages.push(data);
//             hasMore = Array.isArray(data.included_items) && data.included_items.length === 25;
//             page++;
//         }

//         // Merge bundle pages
//         const mergedBundle = { ...allBundlePages[0] };
//         mergedBundle.included_items = allBundlePages.flatMap(p => p.included_items || []);
//         const courseIds = mergedBundle.course_ids || [];

//         console.log("📌 Bundle Course IDs:", courseIds);

//         // ---------------------------------------------------
//         // 2️⃣ Fetch User Enrollments
//         // ---------------------------------------------------
//         const enrollmentsRes = await fetch(
//             `https://api.thinkific.com/api/public/v1/enrollments?user_id=${userId}&limit=200`,
//             {
//                 headers: {
//                     "X-Auth-API-Key": API_KEY,
//                     "X-Auth-Subdomain": SUBDOMAIN
//                 }
//             }
//         );

//         const enrollmentJson = await enrollmentsRes.json();
//         const userEnrollments = Array.isArray(enrollmentJson.items) ? enrollmentJson.items : [];

//         console.log("📌 Total user enrollments:", userEnrollments.length);

//         // ---------------------------------------------------
//         // 3️⃣ Find expiry date using ONLY activePaidCourses
//         // ---------------------------------------------------
//         const validMembershipEnrollments = userEnrollments.filter(e =>
//             activePaidCourses.includes(e.course_name) &&
//             e.expired === false &&
//             e.expired_date
//         );

//         console.log("🎯 Matching membership enrollments:", validMembershipEnrollments);

//         const expiryDates = validMembershipEnrollments.map(e => new Date(e.expired_date));

//         const userMainExpiryDate = expiryDates.length
//             ? new Date(Math.max(...expiryDates)) // latest
//             : null;

//         console.log("📅 Calculated membership expiry:", userMainExpiryDate);

//         if (!userMainExpiryDate) {
//             console.log("❌ No active membership expiry found. Skipping auto-enroll.");
//             return {
//                 statusCode: 200,
//                 headers: corsHeaders,
//                 body: JSON.stringify({
//                     bundle: mergedBundle,
//                     autoEnroll: "User inactive — no valid expiry.",
//                     courses: []
//                 })
//             };
//         }

//         // ---------------------------------------------------
//         // 4️⃣ Find new courses to enroll into
//         // ---------------------------------------------------
//         const alreadyEnrolledIds = userEnrollments
//             .filter(e => e.expired === false)
//             .map(e => e.course_id);

//         const newCoursesToEnroll = courseIds.filter(id => !alreadyEnrolledIds.includes(id));

//         console.log("🆕 New courses for auto-enroll:", newCoursesToEnroll);

//         // ---------------------------------------------------
//         // 5️⃣ Auto-enroll with membership expiry
//         // ---------------------------------------------------
//         let enrollmentResults = [];

//         for (const courseId of newCoursesToEnroll) {
//             const res = await fetch(
//                 `https://api.thinkific.com/api/public/v1/enrollments`,
//                 {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "X-Auth-API-Key": API_KEY,
//                         "X-Auth-Subdomain": SUBDOMAIN
//                     },
//                     body: JSON.stringify({
//                         user_id: userId,
//                         course_id: courseId,
//                         activated_at: new Date().toISOString(),
//                         expiry_date: userMainExpiryDate.toISOString()
//                     })
//                 }
//             );

//             const json = await res.json();

//             enrollmentResults.push({
//                 courseId,
//                 success: res.ok,
//                 response: json
//             });
//         }

//         return {
//             statusCode: 200,
//             headers: corsHeaders,
//             body: JSON.stringify({
//                 bundle: mergedBundle,
//                 autoEnrollResults: enrollmentResults,
//                 appliedExpiryDate: userMainExpiryDate
//             })
//         };

//     } catch (error) {
//         console.error("❌ SERVER ERROR:", error);
//         return {
//             statusCode: 500,
//             headers: corsHeaders,
//             body: JSON.stringify({ error: error.message })
//         };
//     }
// };

// const fetch = require("node-fetch");

// exports.handler = async (event) => {
//     const corsHeaders = {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//     };

//     if (event.httpMethod === "OPTIONS") {
//         return { statusCode: 200, headers: corsHeaders };
//     }

//     try {
//         const body = JSON.parse(event.body || "{}");
//         const { bundleId, userId, userExpiry } = body;

//         if (!bundleId || !userId) {
//             return {
//                 statusCode: 400,
//                 headers: corsHeaders,
//                 body: JSON.stringify({ error: "bundleId and userId are required" })
//             };
//         }

//         console.log("➡ Running for user", userId, "bundle", bundleId);
//         console.log("➡ Received expiry from FE:", userExpiry);

//         const API_KEY = process.env.THINKIFIC_API_KEY;
//         const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

//         // ---------------------------------------------------
//         // 1️⃣ Fetch the Bundle (Pagination)
//         // ---------------------------------------------------
//         let page = 1;
//         let allBundlePages = [];
//         let hasMore = true;

//         while (hasMore) {
//             const res = await fetch(
//                 `https://api.thinkific.com/api/public/v1/bundles/${bundleId}?page=${page}&limit=25`,
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         "X-Auth-API-Key": API_KEY,
//                         "X-Auth-Subdomain": SUBDOMAIN
//                     }
//                 }
//             );

//             const data = await res.json();
//             if (!res.ok) {
//                 return {
//                     statusCode: res.status,
//                     headers: corsHeaders,
//                     body: JSON.stringify(data)
//                 };
//             }

//             allBundlePages.push(data);
//             hasMore = Array.isArray(data.included_items) && data.included_items.length === 25;
//             page++;
//         }

//         // Merge bundle pages
//         const mergedBundle = { ...allBundlePages[0] };
//         mergedBundle.included_items = allBundlePages.flatMap(p => p.included_items || []);
//         const courseIds = mergedBundle.course_ids || [];

//         console.log("📌 Bundle Course IDs:", courseIds);

//         // ---------------------------------------------------
//         // 2️⃣ Fetch User Enrollments
//         // ---------------------------------------------------
//         const enrollmentsRes = await fetch(
//             `https://api.thinkific.com/api/public/v1/enrollments?user_id=${userId}&limit=200`,
//             {
//                 headers: {
//                     "X-Auth-API-Key": API_KEY,
//                     "X-Auth-Subdomain": SUBDOMAIN
//                 }
//             }
//         );

//         const enrollmentJson = await enrollmentsRes.json();
//         const userEnrollments = Array.isArray(enrollmentJson.items) ? enrollmentJson.items : [];

//         console.log("📌 Total user enrollments:", userEnrollments.length);

//         // ---------------------------------------------------
//         // 3️⃣ Use expiry date from frontend (simple & reliable)
//         // ---------------------------------------------------

//         const userMainExpiryDate = userExpiry ? new Date(userExpiry) : null;

//         console.log("📅 FINAL MEMBERSHIP EXPIRY USED:", userMainExpiryDate);

//         if (!userMainExpiryDate) {
//             console.log("❌ No valid membership expiry found. Skipping auto-enroll.");
//             return {
//                 statusCode: 200,
//                 headers: corsHeaders,
//                 body: JSON.stringify({
//                     bundle: mergedBundle,
//                     autoEnroll: "User inactive — no valid expiry.",
//                     courses: []
//                 })
//             };
//         }

//         // ---------------------------------------------------
//         // 4️⃣ Find new courses to enroll into
//         // ---------------------------------------------------
//         const alreadyEnrolledIds = userEnrollments
//             .filter(e => e.expired === false)
//             .map(e => e.course_id);

//         const newCoursesToEnroll = courseIds.filter(id => !alreadyEnrolledIds.includes(id));

//         console.log("🆕 New courses for auto-enroll:", newCoursesToEnroll);

//         // ---------------------------------------------------
//         // 5️⃣ Auto-enroll with membership expiry
//         // ---------------------------------------------------
//         let enrollmentResults = [];

//         for (const courseId of newCoursesToEnroll) {
//             const res = await fetch(
//                 `https://api.thinkific.com/api/public/v1/enrollments`,
//                 {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "X-Auth-API-Key": API_KEY,
//                         "X-Auth-Subdomain": SUBDOMAIN
//                     },
//                     body: JSON.stringify({
//                         user_id: userId,
//                         course_id: courseId,
//                         activated_at: new Date().toISOString(),
//                         expiry_date: userMainExpiryDate.toISOString()
//                     })
//                 }
//             );

//             const json = await res.json();

//             enrollmentResults.push({
//                 courseId,
//                 success: res.ok,
//                 response: json
//             });
//         }

//         // ---------------------------------------------------
//         // 6️⃣ Return Full Response
//         // ---------------------------------------------------
//         return {
//             statusCode: 200,
//             headers: corsHeaders,
//             body: JSON.stringify({
//                 bundle: mergedBundle,
//                 autoEnrollResults: enrollmentResults,
//                 appliedExpiryDate: userMainExpiryDate
//             })
//         };

//     } catch (error) {
//         console.error("❌ SERVER ERROR:", error);
//         return {
//             statusCode: 500,
//             headers: corsHeaders,
//             body: JSON.stringify({ error: error.message })
//         };
//     }
// };
