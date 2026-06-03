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
const http  = require("http");
const url   = require("url");

/**
 * @param {object} payload
 * @returns {Promise<void>}
 */
async function notifyReparationDone(payload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("[webhook] N8N_WEBHOOK_URL non configurée — notification ignorée");
    return;
  }

  const body = JSON.stringify({
    event:        "reparation.done",
    sentAt:       new Date().toISOString(),
    ...payload
  });

  const parsed  = new url.URL(webhookUrl);
  const driver  = parsed.protocol === "https:" ? https : http;
  const options = {
    hostname: parsed.hostname,
    port:     parsed.port || (parsed.protocol === "https:" ? 443 : 80),
    path:     parsed.pathname + parsed.search,
    method:   "POST",
    headers:  {
      "Content-Type":   "application/json",
      "Content-Length": Buffer.byteLength(body)
    }
  };

  return new Promise((resolve) => {
    const req = driver.request(options, (res) => {
      console.log(`[webhook] n8n répondu ${res.statusCode} pour reparation #${payload.reparationId}`);
      resolve();
    });

    req.on("error", (err) => {
      // On ne bloque jamais la réponse API si le webhook échoue
      console.error("[webhook] Erreur envoi n8n :", err.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

module.exports = { notifyReparationDone };
