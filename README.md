# 🌬️ AirSense — AI-Powered Urban Air Quality Awareness Assistant

> Built for the **1M1B AI for Sustainability Virtual Internship** (in collaboration with IBM SkillsBuild & AICTE)

**SDG Alignment:** SDG 11 (Sustainable Cities & Communities) · SDG 3 (Good Health & Well-being)

---

## What is AirSense?

AirSense is a working, deployable web app that lets any citizen ask about the air they breathe and get
**personalized, data-grounded health guidance** — no technical knowledge required.

Unlike a static chatbot demo, AirSense:
- Fetches **real, live air quality data** for any city worldwide (no fake/mock data)
- Builds a fully **transparent, structured AI prompt** grounded in that retrieved data (a RAG pattern)
- Generates a personalized 3-part response (AQI status → health risk → 3 action tips)
- Is **architected for IBM Granite** via watsonx.ai, with a working local fallback so the demo runs
  instantly with zero API keys or cost

## Why this matters (the problem)

Urban air pollution is a major public health crisis, but most citizens have no easy way to translate
raw AQI numbers into "is it safe for *me* to go outside today?" — especially for vulnerable groups like
children, the elderly, and people with asthma or heart conditions. AirSense closes that gap.

## How it works (architecture)

```
User Input (city + health profile)
        │
        ▼
Open-Meteo Geocoding API  ──►  lat / lon
        │
        ▼
Open-Meteo Air Quality API  ──►  live US AQI, PM2.5, PM10, Ozone, NO₂   [RETRIEVAL]
        │
        ▼
promptEngine.js: buildStructuredPrompt()  ──►  structured prompt with
        │                                       system instructions +
        │                                       retrieved data + user profile
        ▼
   ┌────────────────────┬─────────────────────────┐
   │ Granite enabled?    │ No (default)            │
   ▼                     ▼
graniteConnector.js   promptEngine.js:
(watsonx.ai API)      localReasoningEngine()
   │                     │
   └─────────┬───────────┘
             ▼
   Structured 3-part response rendered to user
   (AQI level → health risk → 3 personalized tips)
```

This mirrors exactly the AI workflow described in the project's PowerPoint deck (`/docs` in the original
submission), with one difference: the prompt construction and retrieval steps are **real, working code**,
not just a diagram.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (no build step — runs anywhere) |
| Live data | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) & [Air Quality API](https://open-meteo.com/en/docs/air-quality-api) (free, no key required) |
| AI reasoning | Rule-based engine modeled on documented AQI health thresholds (default) **or** IBM Granite via watsonx.ai (optional, real integration included) |
| AI development partner | IBM Bob (Project Bob) — see `docs/IBM_BOB_USAGE.md` |

## Running Locally

No build tools, no `npm install`, no server required:

1. Download or clone this repository
2. Open `index.html` directly in any modern browser

   — or, for the most reliable experience (some browsers restrict `fetch` on `file://` pages), serve it locally:

   ```bash
   # Python 3
   python -m http.server 8000
   # then open http://localhost:8000
   ```
3. Search for any city, fill in your profile, click **Ask AirSense**

That's it — it fetches real live AQI data immediately.

## Responsible AI

See `docs/RESPONSIBLE_AI.md` for full details. Summary:
- **Fairness:** Uses free, public data sources — no group is disadvantaged by paywalled access
- **Transparency:** The exact prompt sent to the AI model is visible to the user (see "How this answer was generated")
- **Ethics:** Never issues medical diagnoses; always recommends professional consultation
- **Privacy:** No personal data, location, or health information is stored or transmitted to any server — everything runs client-side in the browser

## Credits

- Live data: [Open-Meteo](https://open-meteo.com/) (free, open-source weather & air quality API)
- AI architecture: Designed for IBM Granite via watsonx.ai
- Development partner: IBM Bob
- Submitted as part of the 1M1B AI for Sustainability Virtual Internship, in collaboration with IBM SkillsBuild & AICTE
