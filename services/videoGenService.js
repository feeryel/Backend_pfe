/**
 * videoGenService.js
 * Génère la vidéo récap d'une réparation (audio Piper TTS + FFmpeg).
 * Remplace les nœuds "Execute Command" de n8n (désactivés par défaut sur n8n 2.x).
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const PIPER_DIR = path.join(__dirname, "..", "n8n-assets", "piper");
const PIPER_EXE = path.join(PIPER_DIR, "piper.exe");
const PIPER_MODEL = path.join(PIPER_DIR, "fr_FR-siwis-medium.onnx");
const TMP_DIR = path.join(__dirname, "..", "n8n-assets", "tmp");
const VIDEOS_DIR = path.join(__dirname, "..", "public", "videos");
const PUBLIC_BASE_URL = "http://localhost:3000";

function runCommand(cmd, args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { windowsHide: true });
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

async function generateReparationVideo({ reparationId, videoText }) {
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

  await runCommand("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", "color=c=0x1d4ed8:s=1280x720:d=600",
    "-i", audioPath,
    "-c:v", "libx264", "-tune", "stillimage",
    "-c:a", "aac", "-b:a", "192k",
    "-pix_fmt", "yuv420p",
    "-shortest",
    videoPath
  ]);

  return { videoUrl: `${PUBLIC_BASE_URL}/videos/reparation-${reparationId}.mp4` };
}

module.exports = { generateReparationVideo };
