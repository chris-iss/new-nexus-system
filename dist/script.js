import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


async function getEnvironmentVariables() {

  try {
    const response = await fetch(
      "https://nexus-sys.netlify.app/.netlify/functions/getSupabaseConfig"
    );

    const data = await response.json();
    const { code } = data;

    const activateForm = document.getElementById("submitActivateForm");

    activateForm?.addEventListener("click", function () {
      const activateCode = document.getElementById("activateInput").value;

      if (!activateCode) {
        alert("Please enter an activation code!");
        return;
      }

      if (activateCode === code)
        window.location.href = "http://127.0.0.1:5500/dist/invoice.html";
    });

    // Now you can use the `supabase` client in your frontend code
  } catch (error) {
    console.error("Error fetching environment variables:", error);
  }
}

getEnvironmentVariables();



//INVOICE FORM - Multi-select for courses
const submitInvoiceRequest = async () => {
  const response = await fetch(
    "https://nexus-sys.netlify.app/.netlify/functions/getSupabaseConfig"
  );

  const data = await response.json();
  const { supabaseUrl, supabaseKey, code } = data;

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (code && supabase) {
    const multiSelect = document.getElementById("courseMultiSelect");
    const dropdownOptions = multiSelect.querySelector(".dropdown-options");
    const tagsContainer = multiSelect.querySelector(".tags-container");

    const courses = [
      "Certificate in Business Sustainability",
      "Certificate in Sustainability Plan Development",
      "Certificate in Sustainability Plan Implementation",
      "Certificate in Decarbonisation: Achieving Net Zero",
      "Certificate in Circular Economy",
      "Certificate in Business with Biodiversity",
      "Certificate in Diversity Equity and Inclusion",
      "Certificate in Sustainable Finance",
      "Certificate in Sustainable Business Operations",
      "Certificate in Sustainable Supply Chain",
      "Certificate in Green Marketing",
      "Certificate in ESG Reporting and Auditing",
      "Diploma in Business Sustainability",
    ];

    let selectedCourses = [];

    function populateDropdown() {
      dropdownOptions.innerHTML = "";
      courses.forEach((course) => {
        if (!selectedCourses.includes(course)) {
          const optionDiv = document.createElement("div");
          optionDiv.classList.add("option");
          optionDiv.textContent = course;
          optionDiv.addEventListener("click", () => addCourse(course));
          dropdownOptions.appendChild(optionDiv);
        }
      });
    }

    function addCourse(course) {
      selectedCourses.push(course);
      updateTags();
      populateDropdown();
    }

    function updateTags() {
      tagsContainer.innerHTML = "";
      selectedCourses.forEach((course) => {
        const tagDiv = document.createElement("div");
        tagDiv.classList.add("tag");
        tagDiv.textContent = course;

        const removeSpan = document.createElement("span");
        removeSpan.classList.add("remove-tag");
        removeSpan.textContent = "×";
        removeSpan.addEventListener("click", () => removeCourse(course));

        tagDiv.appendChild(removeSpan);
        tagsContainer.appendChild(tagDiv);
      });
    }

    function removeCourse(course) {
      selectedCourses = selectedCourses.filter((item) => item !== course);
      updateTags();
      populateDropdown();
    }

    multiSelect.addEventListener("click", (e) => {
      e.stopPropagation();
      multiSelect.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      multiSelect.classList.remove("show");
    });

    populateDropdown();

    // Multi-select for course IDs
    const courseIdMultiSelect = document.getElementById("courseIdMultiSelect");
    const courseIdDropdownOptions =
      courseIdMultiSelect.querySelector(".dropdown-options");
    const courseIdTagsContainer =
      courseIdMultiSelect.querySelector(".tags-container");

    const courseIds = [
      "Certificate in Business Sustainability - 2755212",
      "Certificate in Sustainability Plan Development - 2755219",
      "Certificate in Sustainability Plan Implementation - 2755224",
      "Certificate in Decarbonisation: Achieving Net Zero - 2755233",
      " Certificate in Circular Economy - 2755243",
      "Certificate in Business with Biodiversity - 2755260",
      "Certificate in Diversity Equity and Inclusion - 2755264",
      "Certificate in Sustainable Finance - 2755272",
      "Certificate in Sustainable Business Operations - 2755276",
      "Certificate in Sustainable Supply Chain - 2755278",
      "Certificate in Green Marketing - 2755281",
      "Certificate in ESG Reporting and Auditing - 2755283",
      "Certificate in Corporate Sustainability Reporting Directive(CSRD) - 2730358",
      "Diploma in Business Sustainability - 2622273",
    ];

    let selectedCourseIds = [];

    function populateCourseIdDropdown() {
      courseIdDropdownOptions.innerHTML = "";
      courseIds.forEach((id) => {
        if (!selectedCourseIds.includes(id)) {
          const optionDiv = document.createElement("div");
          optionDiv.classList.add("option");
          optionDiv.textContent = id;
          optionDiv.addEventListener("click", () => addCourseId(id));
          courseIdDropdownOptions.appendChild(optionDiv);
        }
      });
    }

    function addCourseId(id) {
      selectedCourseIds.push(id);
      updateCourseIdTags();
      populateCourseIdDropdown();
    }

    function updateCourseIdTags() {
      courseIdTagsContainer.innerHTML = "";
      selectedCourseIds.forEach((id) => {
        const tagDiv = document.createElement("div");
        tagDiv.classList.add("tag");
        tagDiv.textContent = id;

        const removeSpan = document.createElement("span");
        removeSpan.classList.add("remove-tag");
        removeSpan.textContent = "×";
        removeSpan.addEventListener("click", () => removeCourseId(id));

        tagDiv.appendChild(removeSpan);
        courseIdTagsContainer.appendChild(tagDiv);
      });
    }

    function removeCourseId(id) {
      selectedCourseIds = selectedCourseIds.filter((item) => item !== id);
      updateCourseIdTags();
      populateCourseIdDropdown();
    }

    courseIdMultiSelect.addEventListener("click", (e) => {
      e.stopPropagation();
      courseIdMultiSelect.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      courseIdMultiSelect.classList.remove("show");
    });

    populateCourseIdDropdown();

    const form = document.getElementById("enrollmentForm");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      data.course = selectedCourses;
      data.courseId = selectedCourseIds;

      console.log(data);

      try {
        const { data: insertedData, error } = await supabase
          .from("manual_invoicing")
          .insert(data);
        if (error) throw error;
        alert("Form submitted successfully!");
        
      } catch (err) {
        alert("Error submitting form: " + err.message);
      }
    });
  }
};

submitInvoiceRequest();
