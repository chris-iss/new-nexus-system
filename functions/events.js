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

        // Example: Fetch data from 'eventUpdate' table
        const { data, error } = await supabase
            .from('eventUpdate')
            .select('*');

        if (error) {
            console.error("Supabase Error:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
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
