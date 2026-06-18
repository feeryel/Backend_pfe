const mailService = require('./mailService');
const fs = require('fs');
const path = require('path');

// Simple in-memory queue with retry/backoff and failure persistence to file
const queue = [];
let processing = false;
const FAILED_LOG = path.join(__dirname, '..', 'logs', 'failed-mails.log');

function ensureLogsDir() {
  const dir = path.dirname(FAILED_LOG);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function processNext() {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const job = queue.shift();
    const { to, login, motDePasse, role, nom, type = 'user', attemptsLeft = 5, backoffMs = 1000, appareil, reparationId, videoUrl, numero, montantTotal, lien } = job;
    try {
      if (type === 'client') {
        await mailService.sendClientCreatedEmail({ to, login, motDePasse, nom });
      } else if (type === 'reparation_done') {
        await mailService.sendReparationDoneEmail({ to, nom, appareil, reparationId });
      } else if (type === 'video_ready') {
        await mailService.sendVideoReadyEmail({ to, nom, appareil, reparationId, videoUrl });
      } else if (type === 'devis') {
        await mailService.sendDevisEmail({ to, nom, numero, montantTotal, lien });
      } else if (type === 'password_reset') {
        await mailService.sendPasswordResetEmail({ to, login, motDePasse });
      } else {
        await mailService.sendUserCreatedEmail({ to, login, motDePasse, role });
      }
      console.log('Mail job processed for', to);
    } catch (err) {
      console.error('Mail job error for', to, err && err.message);
      if (attemptsLeft > 1) {
        const nextAttempts = attemptsLeft - 1;
        const nextBackoff = backoffMs * 2; // exponential
        console.log(`Requeueing ${to} attemptsLeft=${nextAttempts} backoff=${nextBackoff}ms`);
        // requeue with delay — conserve TOUT le job (type, nom, appareil, videoUrl, etc.)
        setTimeout(() => {
          queue.push({ ...job, attemptsLeft: nextAttempts, backoffMs: nextBackoff });
          // kick processor again
          processNext();
        }, backoffMs);
      } else {
        // give up and persist to failed log
        try {
          ensureLogsDir();
          const record = { to, login, role, error: err && err.message, at: new Date().toISOString() };
          fs.appendFileSync(FAILED_LOG, JSON.stringify(record) + '\n');
          console.error('Mail job failed permanently for', to, '- logged to', FAILED_LOG);
        } catch (e) {
          console.error('Failed to persist failed mail job for', to, e && e.message);
        }
      }
    }
    // small tick to avoid CPU spin
    await sleep(50);
  }
  processing = false;
}

/**
 * Add a mail job to the in-memory queue.
 * Returns a lightweight job object (not a real queue job id).
 */
function addMailJob(data) {
  const job = Object.assign({ attemptsLeft: Number(process.env.MAIL_QUEUE_ATTEMPTS || 5), backoffMs: Number(process.env.MAIL_QUEUE_BACKOFF_MS || 1000) }, data);
  queue.push(job);
  // start processing asynchronously
  processNext().catch(err => console.error('Mail queue processor error:', err && err.message));
  return { queued: true };
}

module.exports = { addMailJob, queueConnected: true };
