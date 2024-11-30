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

        let status = "Completed"

        console.log("REQUEST BODY:", requestBody);

        // Process each order items
        // const proccessOrder = requestBody.line_items.map((item) => ({
        //     firstname: requestBody.billing.first_name,
        //     lastname: requestBody.billing.last_name,
        //     email: requestBody.billing.email,
        //     course: item.name,
        //     quantity: item.quantity,
        //     amount: item.price * item.quantity,
        //     status: requestBody.status,
        //     currency: requestBody.currency_symbol,
        //     date: new Date(),
        //     status_change: status
        // }));

        // Save data to Supabase
        // const { data, error } = await supabase.from("orders").insert(proccessOrder);

        // if (error) {
        //     console.error("Error inserting into Supabase:", error);
        //     return {
        //         statusCode: 500,
        //         body: JSON.stringify({ message: "Error inserting into Supabase", error: error.message }),
        //     };
        // }

        // console.log("INSERTED SUCCESSFULLY:", data);

        // Return success response
        isExecuting = false;
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error("Error processing data:", error.message);

        // Reset execution flag
        isExecuting = false;

        // Return error response
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
