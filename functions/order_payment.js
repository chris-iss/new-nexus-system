const { createClient } = require("@supabase/supabase-js");

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SERVICE_KEY;

const supabase = createClient(supabase_url, supabase_service_key);

exports.handler = async (event) => {
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
            isExecuting = false; 
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Request body is empty or missing" }),
            };
        }

        const requestBody = JSON.parse(event.body);

        let currency = "";

        if (requestBody.currency === "gbp") {
            currency = "£"
        } else if(requestBody.currency === "usd") {
            currency = "$"
        } else {
            currency = "€"
        }

        let status = "Completed"

        const payment_payload = {
            name: requestBody.name,
            amount: `${currency}${requestBody.amount}`,
            description: requestBody.description,
            email: requestBody.email,
            date: requestBody.date,
            status_change: status
        }

        const { data, error } = await supabase.from("payments").insert(payment_payload)

        if (error) {
            console.error("Error inserting into Supabase:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error inserting into Supabase", error: error.message }),
            };
        }

        isExecuting = false; 

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Request processed successfully", requestBody }),
        };
    } catch (error) {
        console.error("ERROR:", error.message);

        isExecuting = false;

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
