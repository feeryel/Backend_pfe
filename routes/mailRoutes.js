const router = require('express').Router();
const mailService = require('../services/mailService');

// GET /mail/test?to=dest@example.com
router.get('/test', async (req, res) => {
  const to = req.query.to;
  if (!to) return res.status(400).json({ message: 'Missing ?to= parameter' });
  try {
    await mailService.sendTestEmail(to);
    res.json({ ok: true, message: `Test email envoyé à ${to}` });
  } catch (err) {
    console.error('Erreur envoi email test:', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

module.exports = router;
