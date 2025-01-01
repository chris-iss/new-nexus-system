import { createClient } from "@supabase/supabase-js";
import { timeStamp } from "console";

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
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Request body is empty or missing" }),
            };
        }

        const requestBody = JSON.parse(event.body);
        
        const convertDate = requestBody.ending_date
        const time_Stamp = new Date(convertDate * 1000);
        const nextPaymentDate = time_Stamp.toLocaleString().split("T")[0]

        const payments = {
            firstname: requestBody.firstname,
            lastname: requestBody.lastname,
            email: requestBody.email,
            currency: requestBody.currency,
            first_payment: requestBody.first_payment,
            amount_due: requestBody.amount_due,
            subscription: requestBody.subscription,
            max_count: requestBody.max_count,
            status: requestBody.status,
            started_date: requestBody.started_date,
            ending_date: nextPaymentDate,
        };

        if (requestBody.subscription === "1") {
            const { data, error } = await supabase.from("installments").insert(payments);

            if (error) {
                console.error("Supabase Insert Error:", error.message);
                throw error;
            }

            console.log("Inserted successfully into installments:", data);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Data inserted successfully", payment: data }),
            };
        } else if(requestBody.subscription === "2") {
            const price = parseInt(requestBody.first_payment * 2);

            const { data, error } = await supabase
                .from("installments")
                .update({ first_payment: price, subscription: requestBody.subscription, ending_date: nextPaymentDate })
                .eq("email", requestBody.email);

            if (error) {
                console.error("Supabase Update Error:", error.message);
                throw error;
            }

            console.log("Updated subscription successfully:", data);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Subscription updated successfully", data }),
            };
        } else if(requestBody.subscription === "3") {
            const price = parseInt(requestBody.first_payment * 3);

            console.log("PRICE:", price)

            const { data, error } = await supabase
                .from("installments")
                .update({ first_payment: price, subscription: requestBody.subscription, ending_date: nextPaymentDate })
                .eq("email", requestBody.email);

            if (error) {
                console.error("Supabase Update Error:", error.message);
                throw error;
            }

            console.log("Updated subscription successfully:", data);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Subscription updated successfully", data }),
            }; 
        } else if(requestBody.subscription === "4") {
            const price = parseInt(requestBody.first_payment * 4);

            const { data, error } = await supabase
                .from("installments")
                .update({ first_payment: price, subscription: requestBody.subscription, ending_date: nextPaymentDate })
                .eq("email", requestBody.email);

            if (error) {
                console.error("Supabase Update Error:", error.message);
                throw error;
            }

            console.log("Updated subscription successfully:", data);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Subscription updated successfully", data }),
            }; 
        }
    } catch (error) {
        console.error("Error processing data:", error.message);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    } finally {
        isExecuting = false;
    }
};
