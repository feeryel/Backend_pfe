const router = require('express').Router();
const { generateReparationVideo } = require('../services/videoGenService');
const { addMailJob } = require('../services/mailQueue');

// POST /internal/video/generate
//   body: { reparationId, videoText, clientEmail?, clientNom?, appareil? }
//   -> { ok, videoUrl }
// Génère la vidéo puis envoie l'email "vidéo prête" via la file d'attente
// (retry/backoff robuste — n8n ne gère plus aucun email).
router.post('/generate', async (req, res) => {
  const { reparationId, videoText, clientEmail, clientNom, appareil } = req.body;
  try {
    const result = await generateReparationVideo({ reparationId, videoText, clientNom, appareil });

    if (clientEmail) {
      addMailJob({
        type: 'video_ready',
        to: clientEmail,
        nom: clientNom,
        appareil,
        reparationId,
        videoUrl: result.videoUrl
      });
      console.log('[VIDEO] Email vidéo mis en file pour', clientEmail);
    }

    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[VIDEO GEN ERROR]', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

module.exports = router;
