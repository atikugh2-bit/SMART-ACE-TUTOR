const https = require("https");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  // Parse body manually if needed
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== "object") body = {};

  const payload = JSON.stringify({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1500,
    system: body.system || "",
    messages: body.messages || [],
  });

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve) => {
    const apiReq = https.request(options, (apiRes) => {
      let data = "";
      apiRes.on("data", (chunk) => { data += chunk; });
      apiRes.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          res.status(apiRes.statusCode).json(parsed);
        } catch (e) {
          res.status(500).json({ error: "Parse error: " + data.slice(0, 100) });
        }
        resolve();
      });
    });
    apiReq.on("error", (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });
    apiReq.write(payload);
    apiReq.end();
  });
};
