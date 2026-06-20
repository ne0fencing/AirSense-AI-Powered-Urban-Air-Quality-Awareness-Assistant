# Responsible AI Considerations — AirSense

Required by the 1M1B AI for Sustainability project guidelines. This document expands on what's
summarized in the README and the project pitch deck.

## Fairness

- All data sources (Open-Meteo Geocoding & Air Quality APIs) are free and require no account, so
  the tool is equally accessible regardless of a user's income or institutional access.
- Health guidance logic (`promptEngine.js`) applies the same rule set to every user — the only
  inputs that change the output are the factual variables (AQI level, age group, health condition,
  activity), not any demographic proxy like name, ethnicity, or location wealth.
- The tool works for any city worldwide with geocoding coverage, not just major/wealthy cities.

## Transparency

- AirSense shows users the **exact structured prompt** that was used to generate their response
  (see the "How this answer was generated" panel), including the live data values retrieved.
- The UI explicitly labels whether a response came from the local rule-based engine or a live
  Granite model call, so users always know which reasoning path produced their answer.
- Data source and retrieval timestamp are shown alongside every result.

## Ethics

- AirSense **never outputs a medical diagnosis**. The system prompt explicitly instructs this, and
  the local reasoning engine's tip language is deliberately advisory ("consider...", "keep
  medication accessible...") rather than directive medical instructions.
- Risk language is calibrated to the actual AQI band — the tool avoids both alarmism on Good/Moderate
  days and false reassurance on Unhealthy+ days.
- Every response recommends professional consultation for medical decisions.

## Privacy

- AirSense stores **no data** between sessions — there is no database, no cookies, no localStorage.
- City search and health profile inputs exist only in browser memory for the duration of the page
  session and are never transmitted to any server except the public AQI API calls (which receive
  only latitude/longitude, not any user-identifying information).
- If a user enables the optional Granite integration, their prompt (including health profile) is
  sent to watsonx.ai per IBM's own data handling policies — this is clearly opt-in and disabled by
  default.

## Known Limitations (documented honestly)

- The local reasoning engine is rule-based, not a trained model — it provides good, sensible
  guidance but lacks the nuance a full LLM could offer for edge cases.
- US AQI breakpoints are used for consistency across all countries; users in regions using a
  different national AQI scale (e.g. China AQI, European AQI) should be aware the category
  thresholds differ slightly from their local government's reporting.
- Pollutant coverage depends on Open-Meteo's monitoring station density, which varies by region.
