import { createClient } from '@supabase/supabase-js';

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SERVICE_KEY;

export const supabase = createClient(supabase_url, supabase_service_key);

export const handler = async (event) => {
    let isExecuting = false;

    if (isExecuting) {
        return {
            statusCode: 409,
            body: JSON.stringify({ message: "Function is already executing" }),
        };
    }

    isExecuting = true;

    try {
        // Validate request body
        if (!event.body) {
            console.error("Empty body received");
            isExecuting = false;
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Request body is empty or missing" }),
            };
        }

        const requestBody = JSON.parse(event.body);

        console.log("FREE COURSE DATA:", requestBody)

        // const fullname = requestBody.fullname.split(" ")

        // // Process each order items
        // const user_data = {
        //     firstname: fullname[0],
        //     lastname: fullname[1],
        //     email: requestBody.email,
        //     module_completed: requestBody.module_completed,
        //     issue_date: requestBody.issue_date,
        // }

        // // Save data to Supabase
        // const { data, error } = await supabase.from("cert_of_completion").insert(user_data);

        if (error) {
            console.error("Error inserting into Supabase:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error inserting into Supabase", error: error.message }),
            };
        }

        // Return success response
        isExecuting = false;
        return {
            statusCode: 200,
            body: JSON.stringify(requestBody),
        };
    } catch (error) {
        console.error("Error processing data:", error);

        // Reset execution flag
        isExecuting = false;

        // Return error response
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
