/**
 * videoGenService.js
 * Génère la vidéo récap d'une réparation (audio Piper TTS + FFmpeg).
 * Remplace les nœuds "Execute Command" de n8n (désactivés par défaut sur n8n 2.x).
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const ASSETS_DIR = path.join(__dirname, "..", "n8n-assets");
const PIPER_DIR = path.join(ASSETS_DIR, "piper");
const PIPER_EXE = path.join(PIPER_DIR, "piper.exe");
const PIPER_MODEL = path.join(PIPER_DIR, "fr_FR-siwis-medium.onnx");
const TMP_DIR = path.join(ASSETS_DIR, "tmp");
const VIDEOS_DIR = path.join(__dirname, "..", "public", "videos");
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "http://localhost:3000";
// Assets visuels (chemins RELATIFs car ffmpeg tourne avec cwd = ASSETS_DIR :
// évite l'échappement pénible des chemins Windows "C:\..." dans le filtergraph)
const LOGO_FILE = "techdoctor.png";
const FONT_BOLD = "arialbd.ttf";
const FONT_REG = "arial.ttf";

// Cloudinary : hébergement public des vidéos (lien HTTPS accessible depuis un téléphone).
// Configuré si CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET sont présents dans .env.
const CLOUDINARY_ENABLED = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);
if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

function runCommand(cmd, args, input, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { windowsHide: true, ...opts });
    let stderr = "";

    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} a échoué (code ${code}): ${stderr.trim()}`));
    });

    if (input !== undefined) {
      child.stdin.write(input, "utf8");
      child.stdin.end();
    }
  });
}

// Nettoie une valeur dynamique pour l'afficher sur une seule ligne dans la vidéo
function cleanLine(s, fallback = "") {
  return (s == null ? "" : String(s)).replace(/[\r\n\t]+/g, " ").trim() || fallback;
}

async function generateReparationVideo({ reparationId, videoText, clientNom, appareil }) {
  if (!reparationId || !/^[A-Za-z0-9_-]+$/.test(String(reparationId))) {
    throw new Error("reparationId invalide");
  }
  if (!videoText || !videoText.trim()) {
    throw new Error("videoText requis");
  }

  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });

  const audioPath = path.join(TMP_DIR, `audio-${reparationId}.wav`);
  const videoPath = path.join(VIDEOS_DIR, `reparation-${reparationId}.mp4`);

  await runCommand(PIPER_EXE, ["--model", PIPER_MODEL, "--output_file", audioPath], videoText);

  // Textes affichés (textfile UTF-8 = gère accents/apostrophes sans échappement)
  const lines = {
    title:  "Réparation terminée",
    name:   `Bonjour ${cleanLine(clientNom, "cher client")}`,
    device: cleanLine(appareil, "Votre appareil"),
    ref:    `Référence #${reparationId}`,
    brand:  "TechDoctor - Atelier de réparation"
  };
  const tf = {};
  for (const [key, val] of Object.entries(lines)) {
    const file = path.join(TMP_DIR, `txt-${reparationId}-${key}.txt`);
    fs.writeFileSync(file, val, "utf8");
    tf[key] = `tmp/txt-${reparationId}-${key}.txt`; // relatif à cwd = ASSETS_DIR
  }

  const dt = (font, file, color, size, y) =>
    `drawtext=fontfile=${font}:textfile=${file}:expansion=none:fontcolor=${color}:fontsize=${size}:x=(w-text_w)/2:y=${y}`;

  const filter =
    `[1:v]scale=340:-1[logo];` +
    `[0:v][logo]overlay=(W-w)/2:80[bg];` +
    `[bg]` + [
      dt(FONT_BOLD, tf.title,  "white",     56, 300),
      dt(FONT_REG,  tf.name,   "0xdbe6ff",  34, 390),
      dt(FONT_BOLD, tf.device, "white",     32, 445),
      dt(FONT_REG,  tf.ref,    "0x9db4e8",  26, 500),
      dt(FONT_REG,  tf.brand,  "0x6b86c9",  22, 650)
    ].join(",") + `[v]`;

  await runCommand("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", "color=c=0x0a1f4d:s=1280x720:d=600",
    "-i", LOGO_FILE,
    "-i", audioPath,
    "-filter_complex", filter,
    "-map", "[v]", "-map", "2:a",
    "-c:v", "libx264", "-tune", "stillimage",
    "-c:a", "aac", "-b:a", "192k",
    "-pix_fmt", "yuv420p",
    "-shortest",
    videoPath
  ], undefined, { cwd: ASSETS_DIR });

  // nettoyage des fichiers texte temporaires
  for (const key of Object.keys(tf)) {
    try { fs.unlinkSync(path.join(TMP_DIR, `txt-${reparationId}-${key}.txt`)); } catch {}
  }

  // Upload vers Cloudinary -> lien HTTPS public (ouvrable depuis un téléphone).
  if (CLOUDINARY_ENABLED) {
    try {
      const res = await cloudinary.uploader.upload(videoPath, {
        resource_type: "video",
        folder: "techdoctor",
        public_id: `reparation-${reparationId}`,
        overwrite: true
      });
      console.log("[VIDEO] Upload Cloudinary OK ->", res.secure_url);
      return { videoUrl: res.secure_url };
    } catch (err) {
      console.error("[VIDEO] Upload Cloudinary échoué, repli sur URL locale:", err.message);
    }
  }

  return { videoUrl: `${PUBLIC_BASE_URL}/videos/reparation-${reparationId}.mp4` };
}

module.exports = { generateReparationVideo };
