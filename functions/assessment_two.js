import { createClient } from "@supabase/supabase-js";

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
      second_completion_date: requestBody.date_completed,
    };

    // Save data to Supabase
    const { data, error } = await supabase
      .from("assessment_two")
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

    const fetchFirstResult = () => {
        setTimeout(async () => {
            try {
                const { data, error } = await supabase.from("assessment_one").select("*");

                console.log("ASSESSMENT_ONE:", data)
    
                if (error) {
                    console.error("Error fetching data:", error);
                    return;
                }
    
                const response = data.filter((entry) => entry.email === requestBody.email);

                console.log("CCONDITION MET:", response)
    
                if (response.length === 0) {
                    console.warn("No matching student data found for the given email");
                } else {
                    const { data: updateData, error: updateError } = await supabase
                        .from("assessment_one")
                        .update({
                            score_two: requestBody.score,
                            second_completion_date: requestBody.date_completed,
                        })
                        .eq("email", requestBody.email); // Use requestBody.email directly
    
                    if (updateError) {
                        console.error("Error updating data:", updateError);
                    } else {
                        console.log("Update was successful", updateData);
                    }
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            }
        }, 30000); // Delay of 30 seconds (30000 ms)
    };
    
    fetchFirstResult();
    

    // Return success response
    isExecuting = false;
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
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
