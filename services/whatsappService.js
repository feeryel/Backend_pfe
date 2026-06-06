const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");

let sock;
let waReady = false;

/**
 * START WHATSAPP CONNECTION
 */
async function startWA() {
  console.log("🚀 Starting WhatsApp...");

  const { state, saveCreds } = await useMultiFileAuthState(
    "auth_info_baileys"
  );

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // ❌ IMPORTANT (we handle QR manually)
    browser: ["TechDoctor", "Chrome", "1.0"]
  });

  waReady = false;

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    console.log("📡 WA STATUS:", connection);

    // 📲 QR CODE DISPLAY (FIX IMPORTANT)
    if (qr) {
      console.log("\n================ QR CODE ================\n");
      qrcode.generate(qr, { small: true });
      console.log("\n=========================================\n");
      console.log("📲 Scan this QR with WhatsApp → Linked Devices");
    }

    // ✅ CONNECTED
    if (connection === "open") {
      console.log("✅ WHATSAPP CONNECTED");
      waReady = true;
    }

    // ❌ DISCONNECTED
    if (connection === "close") {
      waReady = false;

      const reason =
        lastDisconnect?.error?.output?.statusCode;

      console.log("❌ CLOSED REASON:", reason);

      // 🔁 AUTO RECONNECT (except logout)
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔁 RECONNECTING...");
        setTimeout(() => startWA(), 3000);
      } else {
        console.log("🚫 LOGGED OUT → delete auth folder");
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

/**
 * SEND MESSAGE
 */
async function sendWhatsAppMessage(number, message) {
  try {
    if (!sock || !waReady) {
      console.log("⛔ WA NOT READY → message skipped");
      return;
    }

    let clean = number.toString().replace(/\D/g, "");
    if (!clean.startsWith("216")) clean = "216" + clean;

    const jid = `${clean}@s.whatsapp.net`;

    console.log("📤 Sending to:", jid);

    const result = await sock.sendMessage(jid, {
      text: message
    });

    console.log("✅ MESSAGE SENT");
    return result;

  } catch (err) {
    console.error("🔥 WHATSAPP ERROR:", err);
  }
}

module.exports = {
  startWA,
  sendWhatsAppMessage
};