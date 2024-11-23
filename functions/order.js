import { createClient } from '@supabase/supabase-js';

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SERVICE_KEY;

export const supabase = createClient(supabase_url, supabase_service_key );

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

        console.log("REQUESST BODY:", requestBody)

        // Extract data from request
        // const fName = requestBody.billing.first_name;
        // const lastName = requestBody.billing.last_name;
        // const course = requestBody.line_items[0]?.name;
        // const quantity = requestBody.line_items[0]?.quantity;
        // const amount = requestBody.line_items[0]?.subtotal;
        // const status = requestBody.status;
        // const currencySymbol = requestBody.currency_symbol
        // const date = new Date();

        // const insertOrder = {
        //     firstname: fName,
        //     lastname: lastName,
        //     course: course,
        //     quantity: quantity,
        //     amount: amount,
        //     status: status,
        //     currency: currencySymbol,
        //     date: date,
        // };

        const proccessOrder = requestBody.line_items.map((item) => {
            firstname = requestBody.billing.first_name;
            lastname = requestBody.billing.last_name;
            course = item.name;
            quantity = item.quantity;
            amount = item.price * item.quantity;
            status = requestBody.status;
            currencySymbol = requestBody.currency_symbol
            date = new Date();

        })
        // Save data to Supabase
        const { data, error } = await supabase.from("orders").insert([proccessOrder ]);

        if (error) {
            console.error("Error inserting into Supabase:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error inserting into Supabase", error: error.message }),
            };
        }

        console.log("INSERTED SUCCESSFULLY:", data);

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
