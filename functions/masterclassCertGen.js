const fetch = require("node-fetch");

// ---------------------------
// Helpers
// ---------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return { json: {}, raw: "" };
  try {
    return { json: JSON.parse(text), raw: text };
  } catch (e) {
    return { json: { parseError: e.message }, raw: text };
  }
};

const toISODate = (d) => {
  // "YYYY-MM-DD"
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const normalizeTitle = (s) =>
  String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

// ---------------------------
// 1) Course map (Thinkific title -> HubSpot props + Accredible group)
// ---------------------------
const COURSE_MAP = {
  [normalizeTitle("AI for Sustainable Business Growth")]: {
    hubspotIssueDateProp: "masterclass_ai_for_sustainable_business_growth_issue_date",
    hubspotLinkProp: "masterclass_ai_for_sustainable_business_growth_credential_link",
    accredibleGroupId: 805345,
    accredibleGroupName: null,
    credentialName: "AI for Sustainable Business Growth",
  },

  [normalizeTitle("Creating a Culture of Sustainability")]: {
    hubspotIssueDateProp: "masterclass_creating_a_culture_of_sustainability_issue_date",
    hubspotLinkProp: "masterclass_creating_a_culture_of_sustainability_credential_link",
    accredibleGroupId: 805348, 
    accredibleGroupName: null,
    credentialName: "Creating a Culture of Sustainability",
  },

  [normalizeTitle("Decarbonisation and Scope 3: Understanding, Building, and Executing a Climate Strategy")]: {
    hubspotIssueDateProp:
      "masterclass_decarbonisation_and_scope_3_understanding_building_and_executing_issue_date",
    hubspotLinkProp:
      "masterclass_decarbonisation_and_scope_3_understanding_building_and_executing_credential_link",
    accredibleGroupId: 805349, // TODO
    accredibleGroupName: null,
    credentialName: "Decarbonisation and Scope 3: Understanding, Building, and Executing a Climate Strategy",
  },

  [normalizeTitle("Decarbonising your Supply Chain: How to measure Scope 3")]: {
    hubspotIssueDateProp:
      "masterclass_decarbonising_your_supply_chain_how_to_measure_scope_3_issue_date",
    hubspotLinkProp:
      "masterclass_decarbonising_your_supply_chain_how_to_measure_scope_3_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Decarbonising your Supply Chain: How to measure Scope 3",
  },

  [normalizeTitle("Creating Sustainable Pathways: How to Master Your Supply Chain for a Greener Future")]: {
    hubspotIssueDateProp:
      "masterclass_creating_sustainable_pathways_how_to_master_your_supply_chain_issue_date",
    hubspotLinkProp:
      "masterclass_creating_sustainable_pathways_how_to_master_your_supply_chain_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Creating Sustainable Pathways: How to Master Your Supply Chain for a Greener Future",
  },

  [normalizeTitle("Accelerating Industrial Decarbonisation: Strategies, Collaboration & Innovation")]: {
    hubspotIssueDateProp: "masterclass_accelerating_industrial_decarbonisation_strategies_issue_date",
    hubspotLinkProp:
      "masterclass_accelerating_industrial_decarbonisation_strategies_collaboration__credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Accelerating Industrial Decarbonisation: Strategies, Collaboration & Innovation",
  },

  [normalizeTitle("Food for Thought: Understanding the Climate Impacts of Food Waste")]: {
    hubspotIssueDateProp:
      "masterclass_food_for_thought_understanding_the_climate_impacts_of_food_waste_issue_date",
    hubspotLinkProp: "masterclass_food_for_thought_understanding_the_climate_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Food for Thought: Understanding the Climate Impacts of Food Waste",
  },

  [normalizeTitle("The Benefits and Best Practices of the Circular Economy")]: {
    hubspotIssueDateProp:
      "masterclass_the_benefits_and_best_practices_of_the_circular_economy_issue_date",
    hubspotLinkProp:
      "masterclass_the_benefits_and_best_practices_of_the_circular_economy_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "The Benefits and Best Practices of the Circular Economy",
  },

  [normalizeTitle("Mainstreaming Biodiversity in Business")]: {
    hubspotIssueDateProp: "masterclass_mainstreaming_biodiversity_in_business_issue_date",
    hubspotLinkProp: "masterclass_mainstreaming_biodiversity_in_business_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Mainstreaming Biodiversity in Business",
  },

  [normalizeTitle("Demystifying the EU Deforestation Regulation (EUDR)")]: {
    hubspotIssueDateProp: "masterclass_demystifying_the_eu_deforestation_regulation_eudr_issue_date",
    hubspotLinkProp: "masterclass_demystifying_the_eu_deforestation_regulation_eudr_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Demystifying the EU Deforestation Regulation (EUDR)",
  },

  [normalizeTitle("How Digitalisation Accelerates Sustainability")]: {
    hubspotIssueDateProp: "masterclass_how_digitalisation_accelerates_sustainability_issue_date",
    hubspotLinkProp: "masterclass_how_digitalisation_accelerates_sustainability_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "How Digitalisation Accelerates Sustainability",
  },

  [normalizeTitle("Critical Yeast: Creating a Tipping Point for Sustainability in your Business")]: {
    hubspotIssueDateProp: "masterclass_critical_yeast_creating_a_tipping_point_issue_date",
    hubspotLinkProp: "masterclass_critical_yeast_creating_a_tipping_point_for_sustainability_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Critical Yeast: Creating a Tipping Point for Sustainability in your Business",
  },

  [normalizeTitle("Sustainability Plan: Key Steps to Plan Development and Implementation")]: {
    hubspotIssueDateProp: "sustainability_plan_key_steps_to_plan_development_and_implementation_issue_date",
    hubspotLinkProp: "masterclass_sustainability_plan_key_steps_to_plan_development_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Sustainability Plan: Key Steps to Plan Development and Implementation",
  },

  [normalizeTitle("Turning the Tide on Data Pollution")]: {
    hubspotIssueDateProp: "masterclass_turning_the_tide_on_data_pollution_issue_date",
    hubspotLinkProp: "masterclass_turning_the_tide_on_data_pollution_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Turning the Tide on Data Pollution",
  },

  [normalizeTitle("The Expanding World of New Tech and Its Sustainability Implications")]: {
    hubspotIssueDateProp: "masterclass_the_expanding_world_of_new_tech_issue_date",
    hubspotLinkProp:
      "masterclass_the_expanding_world_of_new_tech_and_its_sustainability_implications_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "The Expanding World of New Tech and Its Sustainability Implications",
  },

  [normalizeTitle("Uncovering the Voluntary Sustainability Reporting Standard for SMEs (VSME)")]: {
    hubspotIssueDateProp:
      "masterclass_uncovering_the_voluntary_sustainability_reporting_standard_issue_date",
    hubspotLinkProp:
      "masterclass_uncovering_the_voluntary_sustainability_reporting_standard_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Uncovering the Voluntary Sustainability Reporting Standard for SMEs (VSME)",
  },

  [normalizeTitle("Digital Product Passport: What it Means for You")]: {
    hubspotIssueDateProp: "masterclass_digital_product_passport_what_it_means_for_you_issue_date",
    hubspotLinkProp: "masterclass_digital_product_passport_what_it_means_for_you_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Digital Product Passport: What it Means for You",
  },

  [normalizeTitle("Living Your Values: Personal Sustainability for Business Professionals")]: {
    hubspotIssueDateProp:
      "masterclass_living_your_values_personal_sustainability_for_business_professionals_issue_date",
    hubspotLinkProp: "masterclass_living_your_values_personal_sustainability_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Living Your Values: Personal Sustainability for Business Professionals",
  },

  [normalizeTitle("Strategic Messaging: Engaging Stakeholders for Sustainable Outcomes")]: {
    hubspotIssueDateProp: "masterclass_strategic_messaging_engaging_stakeholders_issue_date",
    hubspotLinkProp: "masterclass_strategic_messaging_engaging_stakeholders_for_sustainable_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Strategic Messaging: Engaging Stakeholders for Sustainable Outcomes",
  },

  [normalizeTitle("Sustainability & CX: An Ever Evolving Journey")]: {
    hubspotIssueDateProp: "masterclass_sustainability__cx_an_ever_evolving_journey_issue_date",
    hubspotLinkProp: "masterclass_sustainability__cx_an_ever_evolving_journey_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Sustainability & CX: An Ever Evolving Journey",
  },

  [normalizeTitle("Sustainability Leadership with the Inner Development Goals")]: {
    hubspotIssueDateProp: "masterclass_sustainability_leadership_with_the_inner_issue_date",
    hubspotLinkProp: "masterclass_sustainability_leadership_with_the_inner_development_goals_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Sustainability Leadership with the Inner Development Goals",
  },

  [normalizeTitle("The Missing Link: Why Culture is the Real Driver of Sustainability Success")]: {
    hubspotIssueDateProp:
      "masterclass_the_missing_link_why_culture_is_the_real_driver_of_sustainability_success_issue_date",
    hubspotLinkProp: "masterclass_the_missing_link_why_culture_is_the_real_driver_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "The Missing Link: Why Culture is the Real Driver of Sustainability Success",
  },

  [normalizeTitle("The Link Between Corporate Culture and Sustainability Performance")]: {
    hubspotIssueDateProp:
      "masterclass_the_link_between_corporate_culture_and_sustainability_performance_issue_date",
    hubspotLinkProp: "masterclass_the_link_between_corporate_culture_and_sustainability_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "The Link Between Corporate Culture and Sustainability Performance",
  },

  [normalizeTitle("Sustainable Christmas: Celebrate with Style, Mindfulness, and Purpose")]: {
    hubspotIssueDateProp: "masterclass_sustainable_christmas_celebrate_with_style_issue_date",
    hubspotLinkProp: "masterclass_sustainable_christmas_celebrate_with_style_mindfulness_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Sustainable Christmas: Celebrate with Style, Mindfulness, and Purpose",
  },

  [normalizeTitle("Green Growth Strategies: Practical Carbon Footprint Reduction for Small, Medium, and Large Businesses")]: {
    hubspotIssueDateProp:
      "masterclass_green_growth_strategies_practical_carbon_footprint_reduction_for_small_issue_date",
    hubspotLinkProp: "masterclass_green_growth_strategies_practical_carbon_footprint_reduction_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName:
      "Green Growth Strategies: Practical Carbon Footprint Reduction for Small, Medium, and Large Businesses",
  },

  [normalizeTitle("Designing for Impact: LCA in the Fashion and Automotive Sectors")]: {
    hubspotIssueDateProp:
      "masterclass_designing_for_impact_lca_in_the_fashion_and_automotive_sectors_issue_date",
    hubspotLinkProp:
      "masterclass_designing_for_impact_lca_in_the_fashion_and_automotive_sectors_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Designing for Impact: LCA in the Fashion and Automotive Sectors",
  },

  [normalizeTitle("Finance for Good: The Colossal Impact of your Bank & Pension")]: {
    hubspotIssueDateProp: "masterclass_finance_for_good_the_colossal_impact_pension_issue_date",
    hubspotLinkProp: "masterclass_finance_for_good_the_colossal_impact_of_your_bank_credential_link",
    accredibleGroupId: 0, // TODO
    accredibleGroupName: null,
    credentialName: "Finance for Good: The Colossal Impact of your Bank & Pension",
  },

  [normalizeTitle("Double Materiality Mastery: Essential Skills for CSRD Compliance")]: {
    hubspotIssueDateProp: "masterclass_double_materiality_mastery_essential_skills_for_csrd_issue_date",
    hubspotLinkProp: "masterclass_double_materiality_mastery_essential_skill_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName: "Double Materiality Mastery: Essential Skills for CSRD Compliance",
  },

  [normalizeTitle("Unlock Digital Task Scaling: Strategic Management, Collaborate Communication, and Brand Positioning for Sustainability")]: {
    hubspotIssueDateProp: "masterclass_unlock_digital_task_scaling_strategic_management_issue_date",
    hubspotLinkProp:
      "masterclass_unlock_digital_task_scaling_strategic_management_collaborate_credential_link",
    accredibleGroupId: 740153, // TODO
    accredibleGroupName: null,
    credentialName:
      "Unlock Digital Task Scaling: Strategic Management, Collaborate Communication, and Brand Positioning for Sustainability",
  },
};

// ---------------------------
// 2) HubSpot client
// ---------------------------
async function hubspotFindContactIdByEmail(email, token) {
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
      properties: ["email"],
      limit: 1,
    }),
  });

  const { json } = await safeJson(res);
  if (!res.ok) throw new Error(`HubSpot search failed: ${res.status} ${JSON.stringify(json)}`);

  return json?.results?.[0]?.id || null;
}

async function hubspotReadContactProperties(contactId, properties, token) {
  const cleanProps = (properties || []).filter(Boolean);
  if (cleanProps.length === 0) return {};

  const qs = cleanProps.map((p) => `properties=${encodeURIComponent(p)}`).join("&");
  const res = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { json } = await safeJson(res);
  if (!res.ok) throw new Error(`HubSpot read failed: ${res.status} ${JSON.stringify(json)}`);

  return json?.properties || {};
}

async function hubspotUpdateContact(contactId, propsObj, token) {
  const res = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties: propsObj }),
  });

  const { json, raw } = await safeJson(res);
  if (!res.ok) {
    // raw is helpful if HubSpot returns HTML or non-json
    throw new Error(`HubSpot update failed: ${res.status} ${raw || JSON.stringify(json)}`);
  }
  return json;
}

// ---------------------------
// 3) Accredible client
// ---------------------------
async function accredibleCreateCredential({
  baseUrl,
  apiKey,
  recipientName,
  recipientEmail,
  credentialName,
  groupId,
  groupName,
  issuedOn,
}) {
  const payload = {
    credential: {
      recipient: { name: recipientName, email: recipientEmail },
      name: credentialName,
      issued_on: issuedOn,
    },
  };

  if (groupId && Number(groupId) > 0) payload.credential.group_id = Number(groupId);
  if (groupName) payload.credential.group_name = groupName;

  const res = await fetch(`${String(baseUrl).replace(/\/$/, "")}/v1/credentials`, {
    method: "POST",
    headers: {
      Authorization: `Token token=${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const { json, raw } = await safeJson(res);
  if (!res.ok) throw new Error(`Accredible create failed: ${res.status} ${raw || JSON.stringify(json)}`);

  return json;
}

function extractAccredibleLink(accredibleResponse) {
  // Accredible responses can vary by account settings.
  // We'll try a bunch of common locations.
  const cred = accredibleResponse?.credential || accredibleResponse;

  return (
    cred?.url ||
    cred?.credential_url ||
    cred?.public_url ||
    cred?.share_url ||
    cred?.recipient?.url ||
    accredibleResponse?.credential?.url ||
    null
  );
}

// ---------------------------
// 4) Main Netlify handler
// ---------------------------
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const HUBSPOT_TOKEN =
      process.env.HUBSPOT_PRIVATE_APP_TOKEN || process.env.HUBSPOT_OAUTH_TOKEN;

      console.log("🔐 HUBSPOT_PRIVATE_APP_TOKEN present?", !!process.env.HUBSPOT_PRIVATE_APP_TOKEN);
console.log("🔐 HUBSPOT_OAUTH_TOKEN present?", !!process.env.HUBSPOT_OAUTH_TOKEN);
console.log("🔐 HUBSPOT_TOKEN length:", HUBSPOT_TOKEN ? HUBSPOT_TOKEN.length : 0);
console.log("🔐 HUBSPOT_TOKEN prefix:", HUBSPOT_TOKEN ? HUBSPOT_TOKEN.slice(0, 8) : "NONE");

    const ACCREDIBLE_API_KEY = process.env.ACCREDIBLE_API_KEY;
    const ACCREDIBLE_BASE_URL = process.env.ACCREDIBLE_BASE_URL || "https://api.accredible.com";

    if (!HUBSPOT_TOKEN || !ACCREDIBLE_API_KEY) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Missing HUBSPOT_PRIVATE_APP_TOKEN (or HUBSPOT_OAUTH_TOKEN) or ACCREDIBLE_API_KEY",
        }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    console.log("📩 Thinkific payload:", JSON.stringify(body));

    // ---------------------------
    // Extract fields (handles a few possible Thinkific shapes)
    // ---------------------------
    const email = body?.user?.email || body?.email || body?.data?.user?.email || null;

    const firstName = body?.user?.first_name || body?.first_name || body?.data?.user?.first_name || "";
    const lastName = body?.user?.last_name || body?.last_name || body?.data?.user?.last_name || "";

    const recipientName =
      (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : body?.user?.name || body?.name || "Learner";

    const courseTitle =
      body?.course?.name ||
      body?.course?.title ||
      body?.course_name ||
      body?.data?.course?.name ||
      body?.data?.course?.title ||
      null;

    const progressRaw =
      body?.percentage_completed ??
      body?.progress ??
      body?.data?.percentage_completed ??
      body?.data?.progress ??
      null;

    const progressNumber = Number(progressRaw);
    const progressIsComplete = progressNumber === 1 || progressNumber === 1.0 || progressNumber === 100;

    const completedAt =
      body?.completed_at ||
      body?.completedAt ||
      body?.data?.completed_at ||
      body?.data?.completedAt ||
      new Date().toISOString();

    if (!email || !courseTitle) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, ignored: true, reason: "Missing email or course title", email, courseTitle }),
      };
    }

    if (!progressIsComplete) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, ignored: true, reason: `Not complete (progress=${progressRaw})` }),
      };
    }

    const mapping = COURSE_MAP[normalizeTitle(courseTitle)];
    if (!mapping) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, ignored: true, reason: "Course title not mapped", courseTitle }),
      };
    }

    const { hubspotIssueDateProp, hubspotLinkProp, accredibleGroupId, accredibleGroupName, credentialName } = mapping;

    // ---------------------------
    // HubSpot: find contact
    // ---------------------------
    const contactId = await hubspotFindContactIdByEmail(email, HUBSPOT_TOKEN);
    if (!contactId) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, ignored: true, reason: "No HubSpot contact found", email }),
      };
    }

    // Read existing values for idempotency (skip only if BOTH exist)
    const existingProps = await hubspotReadContactProperties(
      contactId,
      [hubspotLinkProp, hubspotIssueDateProp],
      HUBSPOT_TOKEN
    );

    const existingLink = hubspotLinkProp ? existingProps?.[hubspotLinkProp] : null;
    const existingIssueDate = hubspotIssueDateProp ? existingProps?.[hubspotIssueDateProp] : null;

    if (existingLink && existingIssueDate) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          alreadyIssued: true,
          courseTitle,
          email,
          existingLink,
          existingIssueDate,
        }),
      };
    }

    // ---------------------------
    // Accredible: create credential
    // ---------------------------
    const issuedOn = toISODate(completedAt) || toISODate(new Date());

    if (!accredibleGroupId || Number(accredibleGroupId) <= 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ok: true, ignored: true, reason: "Missing accredibleGroupId", courseTitle }),
      };
    }

    const accredibleResponse = await accredibleCreateCredential({
      baseUrl: ACCREDIBLE_BASE_URL,
      apiKey: ACCREDIBLE_API_KEY,
      recipientName,
      recipientEmail: email,
      credentialName: credentialName || courseTitle,
      groupId: accredibleGroupId,
      groupName: accredibleGroupName,
      issuedOn,
    });

    console.log("🎓 Accredible response:", JSON.stringify(accredibleResponse));

    const credentialLink = extractAccredibleLink(accredibleResponse);

    // ---------------------------
    // HubSpot: update missing fields
    // ---------------------------
    const propsToUpdate = {};

    // Always set issue date if missing
    if (hubspotIssueDateProp && !existingIssueDate) {
      propsToUpdate[hubspotIssueDateProp] = issuedOn; // text value "YYYY-MM-DD"
    }

    // Set link if missing and we have it
    if (hubspotLinkProp && !existingLink && credentialLink) {
      propsToUpdate[hubspotLinkProp] = credentialLink;
    }

    console.log("🟦 HubSpot propsToUpdate:", propsToUpdate);

    if (Object.keys(propsToUpdate).length > 0) {
      await hubspotUpdateContact(contactId, propsToUpdate, HUBSPOT_TOKEN);
    } else {
      console.log("🟨 Nothing to update in HubSpot (values already present or credentialLink missing).");
    }

    const cred = accredibleResponse?.credential || accredibleResponse;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        issued: true,
        courseTitle,
        email,
        contactId,
        issuedOn,
        hubspotUpdated: propsToUpdate,
        accredibleCredentialId: cred?.id || null,
        credentialLink: credentialLink || null,
      }),
    };
  } catch (error) {
    console.error("❌ masterclassCertificateWebhook ERROR:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message, stack: error.stack }),
    };
  }
};

