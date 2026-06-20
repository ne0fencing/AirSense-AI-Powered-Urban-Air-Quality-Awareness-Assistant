/**
 * promptEngine.js
 * ─────────────────────────────────────────────────────────────────
 * This is the "brain" of AirSense. It does two jobs:
 *
 *   1. buildStructuredPrompt() — constructs the exact structured
 *      prompt that WOULD be sent to an IBM Granite model via
 *      watsonx.ai (system instructions + retrieved AQI data +
 *      user profile). This is shown to the user in the
 *      "transparency" panel so they can see exactly how the AI
 *      is grounded in real data (this is the RAG step).
 *
 *   2. localReasoningEngine() — a deterministic, rule-based
 *      response generator that produces the SAME structured
 *      output format Granite would, using documented AQI health
 *      thresholds (US EPA AQI breakpoints) cross-referenced with
 *      the user's age group, health condition, and activity.
 *
 * Why a local engine exists:
 *   Most students in this internship won't have a funded watsonx.ai
 *   account. This local engine means the prototype is fully working
 *   and demoable with ZERO external AI API cost or key, while still
 *   being driven by the exact same prompt/data structure documented
 *   here. Swapping in a live Granite call is a one-line change in
 *   app.js (see graniteConnector.js).
 * ─────────────────────────────────────────────────────────────────
 */

const SYSTEM_PROMPT = `You are AirSense, an AI assistant helping urban citizens understand air quality and its health impact.
Use the provided live AQI data and WHO / CPCB / US EPA health guidelines to answer queries.
Always respond with exactly three sections:
  (1) Current AQI level and category
  (2) Health risk assessment personalized to the user's profile
  (3) Three specific, personalized action tips
Be conversational, empathetic, and accessible to non-technical users.
Never provide definitive medical diagnoses — always recommend professional consultation for medical decisions.
Ground every claim in the retrieved data provided below. Do not invent AQI values.`;

/**
 * US EPA AQI breakpoints — used to categorize the retrieved AQI value.
 * Source: https://www.airnow.gov/aqi/aqi-basics/
 */
const AQI_BANDS = [
  { max: 50,  category: "Good",                            cssClass: "aqi-good",         risk: "low" },
  { max: 100, category: "Moderate",                         cssClass: "aqi-moderate",     risk: "low-moderate" },
  { max: 150, category: "Unhealthy for Sensitive Groups",   cssClass: "aqi-sensitive",    risk: "moderate" },
  { max: 200, category: "Unhealthy",                        cssClass: "aqi-unhealthy",    risk: "high" },
  { max: 300, category: "Very Unhealthy",                   cssClass: "aqi-veryunhealthy",risk: "very high" },
  { max: Infinity, category: "Hazardous",                   cssClass: "aqi-hazardous",    risk: "severe" },
];

function categorizeAqi(aqi) {
  return AQI_BANDS.find(band => aqi <= band.max);
}

/**
 * Determines whether the user's profile makes them a "sensitive group"
 * member per WHO / EPA guidance.
 */
function isSensitiveProfile(profile) {
  const sensitiveAges = ["child", "elderly"];
  const sensitiveConditions = ["asthma", "heart", "respiratory", "pregnant"];
  return sensitiveAges.includes(profile.ageGroup) || sensitiveConditions.includes(profile.healthCondition);
}

/**
 * Builds the full structured prompt (system + retrieved data + user
 * context) exactly as it would be sent to IBM Granite via watsonx.ai's
 * chat completions endpoint. Shown in the UI for transparency.
 */
function buildStructuredPrompt(cityName, aqiData, profile) {
  const band = categorizeAqi(aqiData.us_aqi);
  return `${SYSTEM_PROMPT}

──────── RETRIEVED DATA (RAG context, fetched live) ────────
City: ${cityName}
US AQI: ${aqiData.us_aqi} (${band.category})
PM2.5: ${aqiData.pm2_5} µg/m³
PM10: ${aqiData.pm10} µg/m³
Ozone (O3): ${aqiData.ozone} µg/m³
Nitrogen Dioxide (NO2): ${aqiData.nitrogen_dioxide} µg/m³
Data timestamp: ${aqiData.time}
Source: Open-Meteo Air Quality API

──────── USER CONTEXT ────────
Age group: ${profile.ageGroup}
Health condition: ${profile.healthCondition}
Planned activity: ${profile.activity}
Sensitive group member: ${isSensitiveProfile(profile) ? "Yes" : "No"}

──────── TASK ────────
Generate the 3-section AirSense response described in the system prompt above.`;
}

/**
 * Local deterministic reasoning engine — produces the same structured
 * output a Granite call would, using rule-based logic over the AQI
 * band + user profile. Returns { headline, riskLine, riskLevel, tips[] }.
 */
function localReasoningEngine(cityName, aqiData, profile) {
  const band = categorizeAqi(aqiData.us_aqi);
  const sensitive = isSensitiveProfile(profile);

  const headline = `Today's AQI in ${cityName} is ${aqiData.us_aqi} — ${band.category}.`;

  let riskLine;
  if (band.category === "Good") {
    riskLine = sensitive
      ? "Air quality is good — low risk even for sensitive groups today."
      : "Air quality is good — minimal health risk for the general population.";
  } else if (band.category === "Moderate") {
    riskLine = sensitive
      ? "Air quality is acceptable, but unusually sensitive individuals should watch for symptoms."
      : "Air quality is acceptable for most people. Minor risk for unusually sensitive individuals.";
  } else if (band.category === "Unhealthy for Sensitive Groups") {
    riskLine = sensitive
      ? "This is a higher-risk day for you specifically — your profile falls into the sensitive group."
      : "General public is unlikely to be affected, but sensitive groups (children, elderly, respiratory/heart conditions) should take precautions.";
  } else if (band.category === "Unhealthy") {
    riskLine = sensitive
      ? "This level is particularly concerning for your profile. Limit outdoor exposure today."
      : "Everyone may begin to experience health effects; sensitive groups face more serious effects.";
  } else if (band.category === "Very Unhealthy") {
    riskLine = "This is a health alert day — everyone is at risk of more serious health effects.";
  } else {
    riskLine = "Hazardous air — this is an emergency health warning. Avoid all outdoor exposure.";
  }

  const tips = generateTips(band, profile, sensitive);

  return { headline, riskLine, band, tips };
}

function generateTips(band, profile, sensitive) {
  const tips = [];
  const severity = ["Good", "Moderate"].includes(band.category) ? "low" :
                    ["Unhealthy for Sensitive Groups"].includes(band.category) ? "medium" : "high";

  // Tip 1: activity-specific
  if (profile.activity === "outdoor_exercise") {
    tips.push(severity === "low"
      ? "Great day for outdoor exercise — air quality won't be a limiting factor."
      : severity === "medium"
        ? "Consider shifting intense outdoor exercise to early morning or indoors today."
        : "Avoid outdoor exercise entirely today — move workouts indoors.");
  } else if (profile.activity === "commute") {
    tips.push(severity === "low"
      ? "Your commute today carries minimal air quality risk."
      : "If possible, keep car windows closed and use recirculated air mode during your commute.");
  } else if (profile.activity === "outdoor_leisure") {
    tips.push(severity === "low"
      ? "Good conditions for outdoor leisure activities today."
      : "Consider shortening outdoor leisure time or rescheduling to a lower-AQI period.");
  } else {
    tips.push("Staying indoors today is a good choice given current conditions.");
  }

  // Tip 2: health-condition specific
  if (profile.healthCondition === "asthma" || profile.healthCondition === "respiratory") {
    tips.push(severity === "low"
      ? "Keep your inhaler/medication accessible as a general precaution."
      : "Keep rescue medication accessible at all times today and avoid known triggers.");
  } else if (profile.healthCondition === "heart") {
    tips.push(severity === "low"
      ? "No special precautions needed today for your heart condition."
      : "Avoid strenuous activity — elevated AQI can add strain on cardiovascular health.");
  } else if (profile.healthCondition === "pregnant") {
    tips.push(severity === "low"
      ? "Conditions are fine for normal daily activity."
      : "Minimize outdoor exposure time and consider an N95 mask if you must go out.");
  } else {
    tips.push(severity === "high"
      ? "Consider an N95 or KN95 mask if you need to be outdoors for extended periods."
      : "No special health precautions needed beyond general awareness.");
  }

  // Tip 3: general / forward-looking
  if (sensitive && severity !== "low") {
    tips.push("Monitor local AQI again this evening — conditions often improve after peak traffic hours.");
  } else if (severity === "high") {
    tips.push("Keep windows closed at home and consider an air purifier if pollution persists.");
  } else {
    tips.push("Air quality can change through the day — check back before planning extended outdoor time.");
  }

  return tips;
}

// Export for use in app.js (also works via <script> global scope in-browser)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildStructuredPrompt, localReasoningEngine, categorizeAqi, isSensitiveProfile, SYSTEM_PROMPT };
}
