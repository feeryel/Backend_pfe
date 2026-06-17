const router = require('express').Router();
const { generateReparationVideo } = require('../services/videoGenService');

// POST /internal/video/generate  { reparationId, videoText } -> { ok, videoUrl }
router.post('/generate', async (req, res) => {
  const { reparationId, videoText } = req.body;
  try {
    const result = await generateReparationVideo({ reparationId, videoText });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[VIDEO GEN ERROR]', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

module.exports = router;
