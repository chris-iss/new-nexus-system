// // exports.handler = async (event) => {
// //     const corsHeaders = {
// //         "Access-Control-Allow-Origin": "*",
// //         "Access-Control-Allow-Methods": "POST, OPTIONS",
// //         "Access-Control-Allow-Headers": "Content-Type",
// //     };

// //     if (event.httpMethod === "OPTIONS") {
// //         return { statusCode: 200, headers: corsHeaders };
// //     }

// //     try {
// //         const body = JSON.parse(event.body || "{}");
// //         const bundleId = body.bundleId;

// //         if (!bundleId) {
// //             return {
// //                 statusCode: 400,
// //                 headers: corsHeaders,
// //                 body: JSON.stringify({ error: "bundleId is required" })
// //             };
// //         }

// //         console.log("➡ Fetching Bundle:", bundleId);

// //         // ---------------------------------------------------
// //         // 1️⃣ PAGINATE BUNDLE PAGES UNTIL NOTHING LEFT
// //         // ---------------------------------------------------
// //         let page = 1;
// //         let allBundlePages = [];
// //         let hasMore = true;

// //         while (hasMore) {
// //             console.log(`📄 Fetching bundle page ${page}...`);

// //             const res = await fetch(
// //                 `https://api.thinkific.com/api/public/v1/bundles/${bundleId}?page=${page}&limit=25`,
// //                 {
// //                     headers: {
// //                         "Content-Type": "application/json",
// //                         "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
// //                         "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
// //                     }
// //                 }
// //             );

// //             const data = await res.json();

// //             if (!res.ok) {
// //                 console.log("❌ Thinkific error:", data);
// //                 return {
// //                     statusCode: res.status,
// //                     headers: corsHeaders,
// //                     body: JSON.stringify(data)
// //                 };
// //             }

// //             // Push current page
// //             allBundlePages.push(data);

// //             console.log(`📦 Bundle page returned:`, data?.included_items?.length || 0);

// //             // STOP when fewer than 25 items OR no included_items
// //             hasMore =
// //                 data.included_items &&
// //                 Array.isArray(data.included_items) &&
// //                 data.included_items.length === 25;

// //             page++;
// //         }

// //         // ---------------------------------------------------
// //         // 2️⃣ MERGE ALL BUNDLE DATA INTO ONE OBJECT
// //         // ---------------------------------------------------
// //         const mergedBundle = { ...allBundlePages[0] };

// //         mergedBundle.included_items = allBundlePages.flatMap(
// //             p => p.included_items || []
// //         );

// //         // Prefer direct course_ids (faster, always present)
// //         const courseIds = mergedBundle.course_ids || [];

// //         console.log("📌 FINAL COURSE IDS:", courseIds);

// //         if (courseIds.length === 0) {
// //             return {
// //                 statusCode: 200,
// //                 headers: corsHeaders,
// //                 body: JSON.stringify({
// //                     bundle: mergedBundle,
// //                     courses: []
// //                 })
// //             };
// //         }

// //         // ---------------------------------------------------
// //         // 3️⃣ FETCH EACH COURSE DETAILS FROM COURSE IDS
// //         // ---------------------------------------------------
// //         const courseRequests = courseIds.map(async (id) => {
// //             console.log(`➡ Fetching Course ${id}`);

// //             const courseRes = await fetch(
// //                 `https://api.thinkific.com/api/public/v1/courses/${id}`,
// //                 {
// //                     headers: {
// //                         "Content-Type": "application/json",
// //                         "X-Auth-API-Key": process.env.THINKIFIC_API_KEY,
// //                         "X-Auth-Subdomain": process.env.THINKIFIC_SUB_DOMAIN
// //                     }
// //                 }
// //             );

// //             const json = await courseRes.json();

// //             if (!courseRes.ok) {
// //                 console.log(`❌ Failed course ${id}`, json);
// //                 return null;
// //             }

// //             console.log(`✔ COURSE ${id} RECEIVED`);
// //             return json;
// //         });

// //         const resolvedCourses = await Promise.all(courseRequests);
// //         const validCourses = resolvedCourses.filter(Boolean);

// //         // ---------------------------------------------------
// //         // 4️⃣ RETURN FINAL MERGED RESPONSE
// //         // ---------------------------------------------------
// //         return {
// //             statusCode: 200,
// //             headers: corsHeaders,
// //             body: JSON.stringify({
// //                 bundle: mergedBundle,
// //                 courses: validCourses
// //             })
// //         };

// //     } catch (error) {
// //         console.error("❌ SERVER ERROR:", error);

// //         return {
// //             statusCode: 500,
// //             headers: corsHeaders,
// //             body: JSON.stringify({ error: error.message })
// //         };
// //     }
// // };


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
//         const { bundleId, userId } = body;

//         if (!bundleId || !userId) {
//             return {
//                 statusCode: 400,
//                 headers: corsHeaders,
//                 body: JSON.stringify({ error: "bundleId and userId are required" })
//             };
//         }

//         console.log("➡ Fetching Bundle:", bundleId);

//         const API_KEY = process.env.THINKIFIC_API_KEY;
//         const SUBDOMAIN = process.env.THINKIFIC_SUB_DOMAIN;

//         // ---------------------------------------------------
//         // 1️⃣ PAGINATE BUNDLE PAGES
//         // ---------------------------------------------------
//         let page = 1;
//         let allBundlePages = [];
//         let hasMore = true;

//         while (hasMore) {
//             console.log(`📄 Fetching bundle page ${page}...`);

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

//             hasMore =
//                 data.included_items &&
//                 data.included_items.length === 25;

//             page++;
//         }

//         // ---------------------------------------------------
//         // 2️⃣ MERGE BUNDLE DATA
//         // ---------------------------------------------------
//         const mergedBundle = { ...allBundlePages[0] };
//         mergedBundle.included_items = allBundlePages.flatMap(p => p.included_items || []);

//         const courseIds = mergedBundle.course_ids || [];

//         console.log("📌 FINAL COURSE IDS:", courseIds);

//         // ---------------------------------------------------
//         // 3️⃣ FETCH COURSE DETAILS
//         // ---------------------------------------------------
//         const courseRequests = courseIds.map(async (id) => {
//             const courseRes = await fetch(
//                 `https://api.thinkific.com/api/public/v1/courses/${id}`,
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         "X-Auth-API-Key": API_KEY,
//                         "X-Auth-Subdomain": SUBDOMAIN
//                     }
//                 }
//             );

//             const json = await courseRes.json();
//             return courseRes.ok ? json : null;
//         });

//         const resolvedCourses = await Promise.all(courseRequests);
//         const validCourses = resolvedCourses.filter(Boolean);

//         // ---------------------------------------------------
//         // 4️⃣ AUTO-ENROLLMENT LOGIC (YOUR 3 RULES)
//         // ---------------------------------------------------

//         console.log("➡ Fetching user enrollments:", userId);

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
//         const userEnrollments = enrollmentJson.items || [];

//         // Rule 1: User must have ACTIVE enrollment
//         const hasActiveEnrollment = userEnrollments.some(e => e.expired === false);

//         if (!hasActiveEnrollment) {
//             console.log("❌ User is NOT active. Skipping auto-enrollment.");
//             return {
//                 statusCode: 200,
//                 headers: corsHeaders,
//                 body: JSON.stringify({
//                     bundle: mergedBundle,
//                     courses: validCourses,
//                     autoEnroll: "User inactive - skipped"
//                 })
//             };
//         }

//         // Rule 2: Find which bundle courses the user already has
//         const alreadyEnrolledIds = userEnrollments
//             .filter(e => e.expired === false)
//             .map(e => e.course_id);

//         // Rule 3: Only enroll NEW bundle courses
//         const newCoursesToEnroll = courseIds.filter(
//             id => !alreadyEnrolledIds.includes(id)
//         );

//         console.log("🆕 New Courses To Enroll:", newCoursesToEnroll);

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
//                         activated_at: new Date().toISOString()
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
//         // 5️⃣ RETURN ALL DATA
//         // ---------------------------------------------------
//         return {
//             statusCode: 200,
//             headers: corsHeaders,
//             body: JSON.stringify({
//                 bundle: mergedBundle,
//                 courses: validCourses,
//                 autoEnrollResults: enrollmentResults
//             })
//         };

//     } catch (error) {
//         return {
//             statusCode: 500,
//             headers: corsHeaders,
//             body: JSON.stringify({ error: error.message })
//         };
//     }
// };


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
        // 2️⃣ MERGE BUNDLE
        // ---------------------------------------------------
        const mergedBundle = { ...allBundlePages[0] };
        mergedBundle.included_items = allBundlePages.flatMap(p => p.included_items || []);

        const courseIds = mergedBundle.course_ids || [];
        console.log("📌 FINAL COURSE IDS:", courseIds);

        // ---------------------------------------------------
        // 3️⃣ FETCH COURSES
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
        // 5️⃣ FIND USER PRIMARY ACTIVE EXPIRY DATE
        // ---------------------------------------------------
        const activeEnrollments = userEnrollments.filter(e => e.expired === false && e.expired_date);
        const expiryDates = activeEnrollments.map(e => new Date(e.expired_date));

        const userMainExpiryDate = expiryDates.length
            ? new Date(Math.max(...expiryDates))
            : null;

        console.log("📅 User main expiry date:", userMainExpiryDate);

        // ---------------------------------------------------
        // 6️⃣ RULE: USER MUST BE ACTIVE
        // ---------------------------------------------------
        if (!userMainExpiryDate) {
            console.log("❌ User is inactive or has no active expiry date. Skipping auto-enroll.");
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    bundle: mergedBundle,
                    courses: validCourses,
                    autoEnroll: "User inactive — no assignments done."
                })
            };
        }

        // ---------------------------------------------------
        // 7️⃣ DETERMINE NEW COURSES TO ENROLL
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
                        expiry_date: userMainExpiryDate.toISOString()  // <-- 🔥 KEY UPDATE
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
        // 9️⃣ RETURN FULL RESPONSE
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
