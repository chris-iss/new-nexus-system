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

    const { data: checkData, error: checkError } = await supabase
      .from("assessment_two")
      .select("*");

    if (checkError) throw checkError;

    const existingRecord = checkData.find((data) => data.email === requestBody.email);

    if (existingRecord) {
      console.log(`This ${requestBody.email} already exists. Hence, record can't be stored.`);
      isExecuting = false;
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Record already exists" }),
      };
    }

    const { data: insertData, error: insertError } = await supabase
      .from("assessment_two")
      .insert(assessment_data);

    if (insertError) {
      console.error("Error inserting into Supabase:", insertError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error inserting into Supabase",
          error: insertError.message,
        }),
      };
    }

    console.log("INSERTED SUCCESSFULLY:", insertData);

    // Delayed Execution
    const fetchFirstResult = async () => {
      const { data: firstData, error: firstError } = await supabase
        .from("assessment_one")
        .select("*");

      if (firstError) {
        console.error("Error fetching data:", firstError);
        return;
      }

      const response = firstData.find((entry) => entry.email === requestBody.email);

      if (!response) {
        console.warn("No matching student data found for the given email.");
        return;
      }

      const { data: updateData, error: updateError } = await supabase
        .from("assessment_one")
        .update({
          score_two: requestBody.score,
          second_completion_date: requestBody.date_completed,
        })
        .eq("email", requestBody.email);

      if (updateError) {
        console.error("Error updating data:", updateError);
      } else {
        console.log("Update was successful:", updateData);
      }
    };

    // Trigger delayed function
    await fetchFirstResult()
    // setTimeout(fetchFirstResult, 30000);

    isExecuting = false;
    return {
      statusCode: 200,
      body: JSON.stringify(insertData),
    };
  } catch (error) {
    console.error("Error processing data:", error.message);
    isExecuting = false;
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
