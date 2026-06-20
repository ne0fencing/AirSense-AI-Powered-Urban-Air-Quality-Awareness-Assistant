# Using IBM Bob to Extend AirSense

IBM Bob (Project Bob) is IBM's AI-first development partner — think of it as an AI pair-programmer
that understands your full codebase and can work in two modes:

- **Architect Mode** — for scoping and designing complex changes before writing code
- **Code Mode** — for fast, iterative implementation

This document gives you ready-to-use prompts for extending AirSense with IBM Bob, satisfying the
internship requirement to practically use the tool on your project.

## Setup

1. Download IBM Bob from [bob.ibm.com](https://bob.ibm.com/)
2. Open this `AirSense-Project` folder in Bob (it reads your repo for full context automatically)
3. Use the prompts below, or write your own

## Recommended tasks to hand to IBM Bob

### 1. Build a secure backend proxy for the Granite/watsonx.ai call

The current `js/graniteConnector.js` calls watsonx.ai directly from the browser, which is fine for a
demo but exposes API keys in production. This is exactly the kind of modernization task Bob is built for.

**Prompt to paste into IBM Bob (Architect Mode):**
```
This repo is a vanilla JS web app called AirSense. js/graniteConnector.js currently calls
watsonx.ai's IAM token endpoint and text-generation endpoint directly from client-side JavaScript,
which exposes the API key. Design a minimal Node.js + Express backend that:
1. Exposes a single POST /api/ask endpoint accepting { prompt }
2. Holds the watsonx.ai API key and project ID as environment variables (.env)
3. Performs the IAM token exchange and Granite text-generation call server-side
4. Returns just the generated text to the frontend
Then update js/app.js to call this new backend endpoint instead of graniteConnector.js directly.
```

### 2. Add automated tests for promptEngine.js

**Prompt:**
```
Add Jest unit tests for js/promptEngine.js covering categorizeAqi() across all AQI bands,
isSensitiveProfile() for each age group and health condition combination, and
localReasoningEngine() output structure (headline, riskLine, band, tips array of length 3).
```

### 3. Add a city-comparison feature

**Prompt:**
```
Extend AirSense to let users compare AQI across two cities side by side. Reuse the existing
geocoding and air-quality fetch functions in js/app.js. Add a toggle in index.html for
"Compare mode" and render two data-panel cards side by side.
```

### 4. Improve accessibility

**Prompt:**
```
Audit index.html and css/style.css for WCAG 2.1 AA accessibility issues — color contrast,
ARIA labels on the city search/suggestions widget, keyboard navigation for the suggestions
dropdown, and screen-reader support for the response panel. Fix what you find.
```

### 5. Add historical AQI trend chart

**Prompt:**
```
Open-Meteo's air quality API supports historical and forecast data via the same endpoint
with different date ranges. Add a 5-day AQI trend mini-chart (use a lightweight charting
approach with no new dependencies, e.g. inline SVG) below the current data panel in
index.html, populated from forecast data for the selected city.
```

## Documenting your IBM Bob usage for submission

For your project submission, take screenshots of:
1. Bob's Architect Mode plan output for one of the tasks above
2. The resulting code diff/changes Bob made
3. The working feature in your browser

Save these in the `screenshots/` folder — they demonstrate practical use of IBM Bob as required by
the internship guidelines, alongside this already-working AirSense prototype.
