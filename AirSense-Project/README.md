# 🌬️ AirSense — AI-Powered Urban Air Quality Awareness Assistant

> Built for the **1M1B AI for Sustainability Virtual Internship** (in collaboration with IBM SkillsBuild & AICTE)

**SDG Alignment:** SDG 11 (Sustainable Cities & Communities) · SDG 3 (Good Health & Well-being)

🔗 **Live Demo:** _add your GitHub Pages link here after deployment (see Deployment section below)_

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

## Project Structure

```
AirSense-Project/
├── index.html                  Main app page
├── css/style.css                Styling (matches the pitch deck's brand palette)
├── js/
│   ├── app.js                   UI wiring, live API calls
│   ├── promptEngine.js          AI prompt construction + local reasoning engine
│   └── graniteConnector.js      Optional real IBM Granite (watsonx.ai) integration
├── docs/
│   ├── IBM_BOB_USAGE.md         How to use IBM Bob to extend this project
│   ├── GRANITE_INTEGRATION.md   How to wire up a real Granite model
│   ├── RESPONSIBLE_AI.md        Fairness / Transparency / Ethics / Privacy notes
│   └── SDG_MAPPING.md           Detailed SDG 11 & SDG 3 alignment
├── screenshots/                 Add your own screenshots here after running the app
└── README.md
```

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

## Deployment (free, public live demo link)

The fastest way to get a public URL for your submission form:

1. Push this folder to a new GitHub repository (see commands below)
2. In the repo, go to **Settings → Pages**
3. Under **Source**, choose `main` branch, `/ (root)` folder → **Save**
4. GitHub will give you a live URL like `https://<your-username>.github.io/<repo-name>/`
5. Add that URL to the top of this README and to your project submission form

### Pushing to GitHub

```bash
cd AirSense-Project
git init
git add .
git commit -m "Initial commit: AirSense AI air quality assistant"
git branch -M main
git remote add origin https://github.com/<your-username>/airsense-project.git
git push -u origin main
```

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
