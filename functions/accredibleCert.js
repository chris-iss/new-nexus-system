const fetch = require("node-fetch");

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "Preflight OK",
    };
  }

  const { firstName, lastName, email } = JSON.parse(event.body || "{}");

  if (!firstName || !lastName || !email) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: "Missing required fields" }),
    };
  }

  const payload = {
    FirstName: firstName,
    LastName: lastName,
    EmailAddress: email,
  };

  try {
    const hubspotBaseURL = `https://api.hubapi.com/crm/v3/objects/contacts/search`;

    const hubspotSearchProperties = {
      after: "0",
      filterGroups: [
        { filters: [{ operator: "EQ", propertyName: "email", value: payload.EmailAddress }] },
        { filters: [{ operator: "EQ", propertyName: "hs_additional_emails", value: payload.EmailAddress }] },
      ],
      limit: 1,
      properties: [
        "id",
        "email",
        "bs_diploma___credential_link",
        "diploma___final_score____",
        "paid_in_full",

        "credential_issue_date",      
        "module_1_crendetial_issue_date",
        "module_2_crendetial_issue_date",
        "module_3_crendetial_issue_date",
        "module_4_crendetial_issue_date",
        "module_5_crendetial_issue_date",
        "module_6_crendetial_issue_date",
        "module_7_crendetial_issue_date",
        "module_8_crendetial_issue_date",
        "module_9_crendetial_issue_date",
        "module_10_crendetial_issue_date",
        "module_11_crendetial_issue_date",
        "module_12_crendetial_issue_date",
        "csrd_crendetial_issue_date",
        "masterclass_accelerating_industrial_decarbonisation_strategies_issue_date",
        "masterclass_ai_for_sustainable_business_growth_issue_date",    
        "masterclass_living_your_values_personal_sustainability_for_business_professionals_issue_date",  
        "masterclass_creating_a_culture_of_sustainability_issue_date",  
        "masterclass_creating_sustainable_pathways_how_to_master_your_supply_chain_issue_date",  
        "masterclass_critical_yeast_creating_a_tipping_point_issue_date",  
        "masterclass_decarbonisation_and_scope_3_understanding_building_and_executing_issue_date",  
        "masterclass_decarbonising_your_supply_chain_how_to_measure_scope_3_issue_date",  
        "masterclass_demystifying_the_eu_deforestation_regulation_eudr_issue_date",  
        "masterclass_designing_for_impact_lca_in_the_fashion_and_automotive_sectors_issue_date",  
        "masterclass_digital_product_passport_what_it_means_for_you_issue_date",  
        "masterclass_food_for_thought_understanding_the_climate_impacts_of_food_waste_issue_date",  
        "masterclass_green_growth_strategies_practical_carbon_footprint_reduction_for_small_issue_date",  
        "masterclass_how_digitalisation_accelerates_sustainability_issue_date",  
        "masterclass_mainstreaming_biodiversity_in_business_issue_date",  
        "masterclass_strategic_messaging_engaging_stakeholders_issue_date",  
        "masterclass_sustainability__cx_an_ever_evolving_journey_issue_date",  
        "masterclass_sustainability_leadership_with_the_inner_issue_date",  
        "masterclass_sustainable_christmas_celebrate_with_style_issue_date",  
        "masterclass_the_benefits_and_best_practices_of_the_circular_economy_issue_date",  
        "masterclass_the_expanding_world_of_new_tech_issue_date",  
        "masterclass_turning_the_tide_on_data_pollution_issue_date",  
        "masterclass_uncovering_the_voluntary_sustainability_reporting_standard_issue_date",  
        "masterclass_unlock_digital_task_scaling_strategic_management_issue_date",
        "masterclass_double_materiality_mastery_essential_skills_for_csrd_issue_date",
        "masterclass_finance_for_good_the_colossal_impact_pension_issue_date",
        "masterclass_living_your_values_personal_sustainability_for_business_professionals_issue_date",
        "masterclass_the_link_between_corporate_culture_and_sustainability_performance_issue_date",
        "masterclass_the_missing_link_why_culture_is_the_real_driver_of_sustainability_success_issue_date",
        "masterclass_certificate_in_sustainability_plan_development_issue_date",
        
        
    
        "unbundled_module_1_credential_link",
        "unbundled_module_2_credential_link",
        "unbundled_module_3_credential_link",
        "unbundled_module_4_credential_link",
        "unbundled_module_5_credential_link",
        "unbundled_module_6_credential_link",
        "unbundled_module_7_credential_link",
        "unbundled_module_8_credential_link",
        "unbundled_module_9_credential_link",
        "unbundled_module_10_credential_link",
        "unbundled_module_11_credential_link",
        "unbundled_module_12_credential_link",
        "unbundled_csrd_credential_link",
        "masterclass_accelerating_industrial_decarbonisation_strategies_collaboration__credential_link",
        "masterclass_ai_for_sustainable_business_growth_credential_link",
        "masterclass_double_materiality_mastery_essential_skill_credential_link",
        "masterclass_creating_a_culture_of_sustainability_credential_link",
        "masterclass_creating_sustainable_pathways_how_to_master_your_supply_chain_credential_link",
        "masterclass_critical_yeast_creating_a_tipping_point_for_sustainability_credential_link",
        "masterclass_decarbonisation_and_scope_3_understanding_building_and_executing_credential_link",
        "masterclass_decarbonising_your_supply_chain_how_to_measure_scope_3_credential_link",
        "masterclass_demystifying_the_eu_deforestation_regulation_eudr_credential_link",
        "masterclass_designing_for_impact_lca_in_the_fashion_and_automotive_sectors_credential_link",
        "masterclass_digital_product_passport_what_it_means_for_you_credential_link",
        "masterclass_finance_for_good_the_colossal_impact_of_your_bank_credential_link",
        "masterclass_food_for_thought_understanding_the_climate_credential_link",
        "masterclass_green_growth_strategies_practical_carbon_footprint_reduction_credential_link",
        "masterclass_how_digitalisation_accelerates_sustainability_credential_link",
        "masterclass_living_your_values_personal_sustainability_credential_link",
        "masterclass_mainstreaming_biodiversity_in_business_credential_link",
        "masterclass_strategic_messaging_engaging_stakeholders_for_sustainable_credential_link",
        "masterclass_sustainability__cx_an_ever_evolving_journey_credential_link",
        "masterclass_sustainability_leadership_with_the_inner_development_goals_credential_link",
        "masterclass_sustainability_plan_key_steps_to_plan_development_credential_link",
        "masterclass_sustainable_christmas_celebrate_with_style_mindfulness_credential_link",
        "masterclass_the_benefits_and_best_practices_of_the_circular_economy_credential_link",
        "masterclass_the_expanding_world_of_new_tech_and_its_sustainability_implications_credential_link",
        "masterclass_the_link_between_corporate_culture_and_sustainability_credential_link",
        "masterclass_the_missing_link_why_culture_is_the_real_driver_credential_link",
        "masterclass_turning_the_tide_on_data_pollution_credential_link",
        "masterclass_uncovering_the_voluntary_sustainability_reporting_standard_credential_link",
        "masterclass_unlock_digital_task_scaling_strategic_management_collaborate_credential_link",
        "masterclass_certificate_in_sustainability_plan_development_credential_link",

        "unbundled_module_1",
        "unbundled_module_2",
        "unbundled_module_3",
        "unbundled_module_4",
        "unbundled_module_5",
        "unbundled_module_6",
        "unbundled_module_7",
        "unbundled_module_8",
        "unbundled_module_9",
        "unbundled_module_10",
        "unbundled_module_11",
        "unbundled_module_12",
        "unbundled_csrd",
    
      ],
      sorts: [{ propertyName: "lastmodifieddate", direction: "ASCENDING" }],
    };

    const searchContact = await fetch(hubspotBaseURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUBSPOT_OAUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hubspotSearchProperties),
    });

    const hubspotContactResponse = await searchContact.json();

    if (!hubspotContactResponse.results || hubspotContactResponse.results.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        },
        body: JSON.stringify({ message: "No contact found in HubSpot." }),
      };
    }

    const hubspotContactData = hubspotContactResponse.results[0].properties;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        message: "Success",
        contact: hubspotContactData,
      }),
    };

  } catch (error) {
    console.error("HubSpot Search Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      },
      body: JSON.stringify({ message: error.message }),
    };
  }
};
