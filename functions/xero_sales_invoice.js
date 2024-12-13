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

        // Process each order items
        const proccessSalesInvoices = {
            email: requestBody.email,
            invoice_number: requestBody.invoice_number,
            reference: requestBody.reference,
            to: requestBody.name,
            date: requestBody.issue_date,
            due: requestBody.total,
            status: requestBody.status
        }

        // Save data to Supabase for Invoices
        const { data, error } = await supabase.from("invoices").insert(proccessSalesInvoices);

        if (error) throw error;

        console.log("INSERTED SUCCESSFULLY - Invoice:", data);


        // Save data to Supabase for Invoices Payments
        const proccessPaymentInvoices = {
            item_code: requestBody.Item_code,
            description: requestBody.item,
            quantity: requestBody.quantity,
            currency: requestBody.currency,
            due_date: requestBody.due_date,
            email: requestBody.email,
            invoice_number: requestBody.invoice_number,
            issue_date: requestBody.issue_date,
            item_name: requestBody.line_item,
            fullname: requestBody.name,
            reference: requestBody.reference,
            sales_person: requestBody.sales_person,
            permission: requestBody.permission,
            status: requestBody.status_paid,
            tax_rate: requestBody.tax_rate,
            total: requestBody.total,
            type: requestBody.type
          }

          const { data_2, error_2 } = await supabase.from("invoice_payments").insert(proccessPaymentInvoices);

          if (error_2) throw error_2;

          console.log("INSERTED SUCCESSFULLY - Invoice Payments:", data_2);

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
