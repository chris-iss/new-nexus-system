import { createClient } from "@supabase/supabase-js";

const supabase_url = process.env.SUPABASE_URL;
const supabase_service_key = process.env.SERVICE_KEY;

export const supabase = createClient(supabase_url, supabase_service_key);

const form = document.getElementById("enrollmentForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  const newData = {
    email: data.email,
    status: data.status,
    course: data.course,
    courseId: data.courseId,
    diplomaQty: data.diplomaQty,
    certQty: data.certQty,
    date: data.date
  }

  console.log("FORM DATA:", data)

  console.log("NEW DATA", newData)

  try {
    // const { data, error } = await supabase.from("installments").insert(payments);


  } catch (err) {
    console.error("Error:", err);
    alert("There was an error submitting the form.");
  }
});
