import { createClient } from '@supabase/supabase-js';

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SERVICE_KEY;

export const supabase = createClient(supabase_url, supabase_service_key);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

        const status = "Completed";

        // Process each order item
        const proccessOrders = requestBody.line_items.map((item) => ({
            firstname: requestBody.billing.first_name,
            lastname: requestBody.billing.last_name,
            email: requestBody.billing.email,
            course: item.name,
            quantity: item.quantity,
            amount: item.price * item.quantity,
            status: requestBody.status,
            currency: requestBody.currency_symbol,
            date: new Date(),
            status_change: status,
        }));

        // Insert orders into Supabase
        const { data, error } = await supabase.from("orders").insert(proccessOrders);

        if (error) {
            console.error("Error inserting into Supabase:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error inserting into Supabase", error: error.message }),
            };
        }

        console.log("INSERTED SUCCESSFULLY:", data);

        // Wait for 1 minute before fetching payment data
        await delay(24000);

        // Fetch payments data
        const { data: userData, error: userError } = await supabase.from("payments").select("*");

        if (userError) {
            console.error("Error fetching from payments:", userError);
            isExecuting = false;
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Error fetching from payments", error: userError.message }),
            };
        }

        // Update order IDs
        const updateOrderId = async () => {
            if (userData && userData.length > 0) {
                for (const item of userData) {
                    proccessOrders.forEach(async (order) => {
                        if (item.email === order.email) {
                            const { data: updateData, error: updateError } = await supabase
                                .from("orders")
                                .update({ order_id: item.description })
                                .eq("email", item.email);

                            if (updateError) {
                                console.error("Error updating order_id:", updateError);
                            } else {
                                console.log("Order ID updated successfully:", updateData);
                            }
                        }
                    });
                }
            } else {
                console.error("No user data found in payments table");
            }
        };

        await updateOrderId();

        // Return success response
        isExecuting = false;
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Order processing completed", data }),
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
