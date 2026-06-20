/**
 * graniteConnector.js
 * ─────────────────────────────────────────────────────────────────
 * OPTIONAL real integration with an IBM Granite model via watsonx.ai.
 *
 * Disabled by default — AirSense works fully without this file's
 * function ever succeeding, because app.js always falls back to
 * promptEngine.localReasoningEngine() on any error.
 *
 * ⚠️ IMPORTANT SECURITY NOTE FOR PRODUCTION:
 * watsonx.ai authentication is a two-step process:
 *   1. Exchange your IBM Cloud API key for a short-lived IAM token
 *      (POST https://iam.cloud.ibm.com/identity/token)
 *   2. Use that IAM token as a Bearer token to call the watsonx.ai
 *      text-generation endpoint.
 * Both calls require a server-side environment — calling them
 * directly from client-side JS (as done below, for prototype/demo
 * purposes only) exposes your API key in the browser. For a real
 * deployment, move this logic to a small backend (Node/Express,
 * Python/Flask, etc.) that holds the credentials in environment
 * variables and exposes a single safe endpoint to the frontend.
 *
 * This exact task ("build me a backend proxy for this watsonx.ai
 * call") is a great first task to hand to IBM Bob — see
 * docs/IBM_BOB_USAGE.md for a ready-to-paste prompt.
 * ─────────────────────────────────────────────────────────────────
 */

async function getIamToken(apiKey) {
  const res = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(apiKey)}`,
  });
  if (!res.ok) throw new Error("IAM token exchange failed");
  const data = await res.json();
  return data.access_token;
}

/**
 * Calls IBM Granite (e.g. granite-13b-chat or granite-3-8b-instruct)
 * via watsonx.ai's text generation endpoint, using the structured
 * prompt built by promptEngine.buildStructuredPrompt().
 *
 * @param {string} prompt - full structured prompt
 * @param {string} apiKey - IBM Cloud API key
 * @param {string} projectId - watsonx.ai project ID
 * @returns {Promise<string>} raw model text output
 */
async function callGraniteModel(prompt, apiKey, projectId) {
  const region = "us-south"; // change to your watsonx.ai region
  const token = await getIamToken(apiKey);

  const res = await fetch(`https://${region}.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      model_id: "ibm/granite-3-8b-instruct",
      input: prompt,
      project_id: projectId,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`watsonx.ai request failed: ${errText}`);
  }

  const data = await res.json();
  return data.results?.[0]?.generated_text?.trim() || "";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { callGraniteModel, getIamToken };
}
