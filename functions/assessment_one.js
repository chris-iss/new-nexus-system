import { createClient } from "@supabase/supabase-js";
import { error } from "console";

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

    console.log("REQUEST BODY:", requestBody);

    // Process each order items
    const assessment_data = {
      assessment_id: requestBody.assessment_id,
      firstname: requestBody.firstname,
      lastname: requestBody.lastname,
      email: requestBody.email,
      score: requestBody.score,
      attempt: requestBody.attempt,
      status: requestBody.status,
      first_completion_date: requestBody.date_completed,
      second_completion_date: "Date not Available",
    };

    // Save data to Supabase
    const { data: checkData, error: checkError } = await supabase
      .from("assessment_one")
      .select("*");

    if (checkError) throw error;

    if (checkData.length === 0) {
        console.log("Assessment table is empty")
    } else {

        checkData.forEach(async(data) => {
            if (data.email === requestBody.email) {
                console.log(`This ${requestBody.email} already exist. Hence record ccan't be stored`);
              } else {
                const { data, error } = await supabase
                  .from("assessment_one")
                  .insert(assessment_data);
        
                if (error) {
                  console.error("Error inserting into Supabase:", error);
                  return {
                    statusCode: 500,
                    body: JSON.stringify({
                      message: "Error inserting into Supabase",
                      error: error.message,
                    }),
                  };
                }
        
                console.log("INSERTED SUCCESSFULLY:", data);
        
                // Return success response
                isExecuting = false;
                return {
                  statusCode: 200,
                  body: JSON.stringify(data),
                };
              }
        })
    }
  } catch (error) {
    console.error("Error processing data:", error.message);

    // Reset execution flag
    isExecuting = false;

    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
