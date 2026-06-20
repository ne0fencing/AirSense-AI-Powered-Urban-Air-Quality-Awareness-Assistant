# Connecting a Real IBM Granite Model (watsonx.ai)

AirSense ships with a working local reasoning engine so the demo runs instantly with no API key.
This guide explains how to optionally wire in a real IBM Granite model call.

## Prerequisites

1. An IBM Cloud account: https://cloud.ibm.com/registration
2. A watsonx.ai project: https://dataplatform.cloud.ibm.com/wx/home
3. An IBM Cloud API key: **Manage → Access (IAM) → API keys → Create**
4. Your watsonx.ai **Project ID** (found in your project's Manage tab)

## Using it in the demo UI

1. Open `index.html` in your browser
2. Expand **"⚙️ Advanced: Connect a real IBM Granite model (optional)"**
3. Paste your API key and Project ID
4. Check **"Use live Granite model for next query"**
5. Click **Ask AirSense** as normal

If the Granite call fails for any reason (network, quota, invalid key), AirSense automatically falls
back to the local reasoning engine — the demo never breaks.

## ⚠️ Security note

`js/graniteConnector.js` calls watsonx.ai directly from the browser for demo simplicity. This means
your API key is visible in browser dev tools while you're using it. **Do not commit your API key to
GitHub**, and do not use this client-side approach in a real production deployment — see
`docs/IBM_BOB_USAGE.md` task #1 for a prompt to have IBM Bob build you a secure backend proxy instead.

## Model used

The connector defaults to `ibm/granite-3-8b-instruct`. You can swap this for any other Granite model
available in your watsonx.ai project by editing the `model_id` field in
`js/graniteConnector.js` → `callGraniteModel()`.

## Region

The connector defaults to the `us-south` watsonx.ai region. If your project is in a different region
(e.g. `eu-de`, `eu-gb`, `jp-tok`), update the `region` constant in `graniteConnector.js` accordingly.
