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

        // First Insert: Sales Invoices
        const proccessSalesInvoices = {
            email: requestBody.email,
            invoice_number: requestBody.invoice_number,
            reference: requestBody.reference,
            to: requestBody.name,
            date: requestBody.issue_date,
            due: requestBody.total,
            status: requestBody.status,
        };

        const { data: salesData, error: salesError } = await supabase.from("invoices").insert(proccessSalesInvoices);

        if (salesError) {
            console.error("Error inserting sales invoice:", salesError);
            throw salesError;
        }

        console.log("Inserted successfully into invoices:", salesData);

        // Second Insert: Invoice Payments
        const proccessPaymentInvoices = {
            item_code: requestBody.Item_code,
            description: requestBody.item,
            quantity: requestBody.quantity,
            currency: requestBody.currency,
            due_date: requestBody.due_date,
            email: requestBody.email,
            invoice_number: requestBody.invoice_number,
            issue_date: requestBody.issue_date,
            line_item: requestBody.line_item,
            fullname: requestBody.name,
            reference: requestBody.reference,
            sales_person: requestBody.sales_person,
            permission: requestBody.permission,
            status: requestBody.status_paid,
            tax_rate: requestBody.tax_rate,
            total: requestBody.total,
            type: requestBody.type,
        };

        const { data: paymentsData, error: paymentsError } = await supabase
            .from("invoice_payments")
            .insert(proccessPaymentInvoices);

        if (paymentsError) {
            console.error("Error inserting invoice payments:", paymentsError);
            throw paymentsError;
        }

        console.log("Inserted successfully into invoice_payments:", paymentsData);

        isExecuting = false;
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Data inserted successfully",
                invoices: salesData,
                invoice_payments: paymentsData,
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
