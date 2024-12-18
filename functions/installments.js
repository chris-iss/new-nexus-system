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
        if (!event.body) {
            console.error("Empty body received");
            isExecuting = false;
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Request body is empty or missing" }),
            };
        }

        const requestBody = JSON.parse(event.body);

        console.log("DATA:", requestBody)

        // First Insert: Sales Invoices
        // const payments = {
        //     firstnname: requestBody.firstname,
        //     lastname: requestBody.lastname,
        //     email: requestBody.email,
        //     subscription: requestBody.subscription,
        //     max_count: requestBody.max_count,
        //     started_data: requestBody.started_date,
        //     last_date_due: requestBody.last_date_due,
        //     status: requestBody.status
        // };

        // const { data: salesData, error: salesError } = await supabase.from("invoices").insert(proccessSalesInvoices);

        // if (salesError) {
        //     console.error("Error inserting sales invoice:", salesError);
        //     throw salesError;
        // }

        // console.log("Inserted successfully into invoices:", salesData);

       
        isExecuting = false;
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Data inserted successfully",
                payment: requestBody,
            }),
        };
    } catch (error) {
        console.error("Error processing data:", error.message);

        isExecuting = false;

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
