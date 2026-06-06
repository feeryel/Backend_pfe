/**
 * webhookService.js
 * Envoie un événement POST vers n8n quand une réparation passe à DONE.
 *
 * Configuration : N8N_WEBHOOK_URL dans .env
 *
 * Payload envoyé :
 *   {
 *     event      : "reparation.done",
 *     reparationId,
 *     clientId,
 *     clientNom,
 *     clientEmail,
 *     clientTel,
 *     appareil   : "Marque Modele",
 *     dateFinRep,
 *     sentAt     : ISO date
 *   }
 */

const https = require("https");
const http = require("http");
const url = require("url");

async function notifyReparationDone(payload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  console.log("[WEBHOOK] Triggering n8n...");

  if (!webhookUrl) {
    console.warn("[WEBHOOK] Missing N8N_WEBHOOK_URL");
    return;
  }

  const body = JSON.stringify({
    event: "reparation.done",
    sentAt: new Date().toISOString(),
    ...payload
  });

  const parsed = new url.URL(webhookUrl);
  const driver = parsed.protocol === "https:" ? https : http;

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    }
  };

  return new Promise((resolve, reject) => {
    const req = driver.request(options, (res) => {
      console.log("[WEBHOOK] n8n status:", res.statusCode);

      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        console.log("[WEBHOOK RESPONSE]", data);
        resolve();
      });
    });

    req.on("error", (err) => {
      console.error("[WEBHOOK ERROR]", err.message);
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

module.exports = { notifyReparationDone };