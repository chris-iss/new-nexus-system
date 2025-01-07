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

        const tasks = checkData.map(async (data) => {
            if (data.email === requestBody.email) {
              console.log("Data already exists in Assessment_One Table");
              return null; // No action needed
            } else {
              try {
                const { data: insertedData, error } = await supabase
                  .from("assessment_one")
                  .insert(assessment_data);
          
                if (error) {
                  console.error("Error inserting into Supabase:", error);
                  throw new Error(error.message);
                }
          
                console.log("INSERTED SUCCESSFULLY:", insertedData);
                return insertedData;
              } catch (error) {
                console.error("Unexpected error:", error.message);
                throw error;
              }
            }
          });
          
          try {
            const results = await Promise.all(tasks);
            console.log("All tasks completed:", results);
          } catch (error) {
            console.error("Error processing tasks:", error.message);
          }
          
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
