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

        console.log("INVOICE PAYMENT:", requestBody)

        // Process each order items
        const proccessPaymentInvoices = {
            item_code: requestBody.Item_code,
            description: requestBody.description,
            quantity: requestBody.quantity,
            currency: requestBody.currency,
            due_date: requestBody.due_date,
            email: requestBody.email,
            invoice_number: requestBody.invoice_number,
            issue_date: requestBody.issue_date,
            item_name: requestBody.item,
            line_item: requestBody.line_item,
            fullname: requestBody.name,
            reference: requestBody.reference,
            sales_person: requestBody.sales_person,
            permission: requestBody.permission,
            status: requestBody.status_paid,
            tax_rate: requestBody.tax_rate,
            total: requestBody.total,
            type: requestBody.type
          }

        // // Save data to Supabase
        const { data, error } = await supabase.from("invoice_payments").insert(proccessPaymentInvoices);

        if (error) throw error

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
            body: JSON.stringify(requestBody),
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
