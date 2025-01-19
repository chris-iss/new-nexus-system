const form = document.getElementById("enrollmentForm");

console.log("FORM", form)

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  try {
    const response = await fetch("https://hooks.zapier.com/hooks/catch/14129819/2zti9qh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    alert(result.message || "Form submitted successfully!");
  } catch (err) {
    console.error("Error:", err);
    alert("There was an error submitting the form.");
  }
});
