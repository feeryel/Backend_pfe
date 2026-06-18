// Cleaned mailService using nodemailer with transporter verification
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  pool: true,
  maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 5),
  maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 100),
  requireTLS: process.env.SMTP_REQUIRE_TLS !== 'false',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined,
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 5000),
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
  tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' }
});

const fromAddress = process.env.EMAIL_FROM || process.env.MAIL_FROM_ADDRESS || 'no-reply@techdoctor.local';

async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log('Mail transporter OK — ready to send emails');
  } catch (err) {
    console.warn('Mail transporter verification failed:', err.message || err);
  }
}

verifyTransporter();

const ROLE_LABELS = {
  admin: 'Administrateur',
  technicien: 'Technicien',
  reception: 'Réception',
  responsable_reparation: 'Responsable Réparation',
  achat_stock: 'Achat / Stock',
  client: 'Client'
};

function buildEmailContent({ login, motDePasse, role }) {
  const appUrl = process.env.APP_URL || 'https://regal-cobbler-e2516a.netlify.app';
  const roleLabel = ROLE_LABELS[role] || role;
  const subject = 'Bienvenue chez TechDoctor — vos identifiants';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px 14px 0 0;padding:32px 28px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Bienvenue chez TechDoctor 👋</h1>
        <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">Votre compte a été créé</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:0 0 14px 14px;padding:28px;">
        <p style="margin:0 0 16px;">Bonjour,</p>
        <p style="margin:0 0 20px;color:#374151;">
          Un compte <strong>TechDoctor</strong> vient d'être créé pour vous avec le rôle
          <strong>${roleLabel}</strong>. Vous pouvez dès maintenant vous connecter à votre espace.
        </p>

        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-weight:700;color:#6d28d9;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">Vos identifiants de connexion</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;width:130px;">Identifiant</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${login}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Mot de passe</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${motDePasse}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Rôle</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${roleLabel}</td>
            </tr>
          </table>
        </div>

   

        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-bottom:16px;">
          <strong>⚠️ Conseil de sécurité :</strong> Changez votre mot de passe après votre première connexion.
        </div>

        <p style="font-size:12px;color:#9ca3af;margin:0;">
          Si vous n'êtes pas à l'origine de cette création de compte, contactez votre administrateur.
        </p>
      </div>
      <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px;">
        TechDoctor — Service de réparation
      </p>
    </div>
  `;

  const text = `Bonjour,\n\nUn compte TechDoctor a été créé pour vous.\n\nIdentifiant : ${login}\nMot de passe : ${motDePasse}\nRôle : ${roleLabel}\n\nConnectez-vous sur : ${appUrl}\n\nSi vous n'êtes pas à l'origine de cette création de compte, contactez votre administrateur.\n\nCordialement,\nL'équipe TechDoctor`;

  return { subject, text, html };
}

function buildTestContent() {
  return {
    subject: "Test d'envoi — TechDoctor",
    text: "Ceci est un email de test envoyé depuis le backend TechDoctor.",
    html: '<p>Ceci est un <strong>email de test</strong> envoyé depuis le backend TechDoctor.</p>'
  };
}

exports.sendUserCreatedEmail = async ({ to, login, motDePasse, role }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP non configuré. Vérifiez SMTP_HOST, SMTP_PORT, SMTP_USER et SMTP_PASS.');
  }

  const mailOptions = {
    from: fromAddress,
    to,
    ...buildEmailContent({ login, motDePasse, role })
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async ({ to, login, motDePasse }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP non configuré.');
  }

  const appUrl = process.env.APP_URL || 'https://regal-cobbler-e2516a.netlify.app';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px 14px 0 0;padding:32px 28px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Réinitialisation du mot de passe 🔑</h1>
        <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">Votre nouveau mot de passe TechDoctor</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:0 0 14px 14px;padding:28px;">
        <p style="margin:0 0 16px;">Bonjour,</p>
        <p style="margin:0 0 20px;color:#374151;">
          Vous avez demandé la réinitialisation de votre mot de passe TechDoctor.
          Un nouveau mot de passe a été généré pour votre compte.
        </p>

        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-weight:700;color:#6d28d9;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">Vos nouveaux identifiants</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;width:130px;">Identifiant</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${login}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Mot de passe</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${motDePasse}</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;border-radius:10px;padding:12px 28px;font-weight:700;font-size:15px;">
            Se connecter →
          </a>
        </div>

        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-bottom:16px;">
          <strong>⚠️ Conseil de sécurité :</strong> Changez ce mot de passe dès votre prochaine connexion.
        </div>

        <p style="font-size:12px;color:#9ca3af;margin:0;">
          Si vous n'êtes pas à l'origine de cette demande, contactez votre administrateur immédiatement.
        </p>
      </div>
      <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px;">
        TechDoctor — Service de réparation
      </p>
    </div>
  `;

  const text = `Bonjour,\n\nVotre mot de passe TechDoctor a été réinitialisé.\n\nIdentifiant : ${login}\nNouveau mot de passe : ${motDePasse}\n\nConnectez-vous sur : ${appUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, contactez votre administrateur.\n\nCordialement,\nL'équipe TechDoctor`;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Votre mot de passe TechDoctor a été réinitialisé',
    text,
    html
  });
};

exports.sendClientCreatedEmail = async ({ to, login, motDePasse, nom }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP non configuré.');
  }

  const appUrl = process.env.APP_URL || 'https://regal-cobbler-e2516a.netlify.app';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px 14px 0 0;padding:32px 28px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Bienvenue chez TechDoctor 👋</h1>
        <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">Votre espace client a été créé</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:0 0 14px 14px;padding:28px;">
        <p style="margin:0 0 16px;">Bonjour <strong>${nom}</strong>,</p>
        <p style="margin:0 0 20px;color:#374151;">
          La réception TechDoctor vient de créer votre espace client.
          Vous pouvez dès maintenant suivre l'état de vos réparations en ligne.
        </p>

        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-weight:700;color:#6d28d9;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">Vos identifiants de connexion</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;width:130px;">Identifiant</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${login}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Mot de passe</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${motDePasse}</td>
            </tr>
          </table>
        </div>



        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-bottom:16px;">
          <strong>⚠️ Conseil de sécurité :</strong> Changez votre mot de passe après votre première connexion.
        </div>

        <p style="font-size:12px;color:#9ca3af;margin:0;">
          Si vous n'êtes pas à l'origine de cette création de compte, ignorez cet email ou contactez-nous.
        </p>
      </div>
      <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px;">
        TechDoctor — Service de réparation
      </p>
    </div>
  `;

  const text = `Bonjour ${nom},\n\nVotre espace client TechDoctor a été créé.\n\nIdentifiant : ${login}\nMot de passe : ${motDePasse}\n\nConnectez-vous sur : ${appUrl}\n\nCordialement,\nL'équipe TechDoctor`;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Vos identifiants TechDoctor — Bienvenue !',
    text,
    html
  });
};

exports.sendReparationDoneEmail = async ({ to, nom, appareil, reparationId }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP non configuré.');
  }

  const appUrl = process.env.APP_URL || 'https://regal-cobbler-e2516a.netlify.app';
  const appareilStr = appareil || 'votre appareil';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px 14px 0 0;padding:32px 28px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Votre appareil est prêt ✅</h1>
        <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">TechDoctor — Service de réparation</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:0 0 14px 14px;padding:28px;">
        <p style="margin:0 0 16px;">Bonjour <strong>${nom}</strong>,</p>
        <p style="margin:0 0 20px;color:#374151;">
          Nous avons le plaisir de vous informer que votre appareil
          <strong>${appareilStr}</strong> a été réparé avec succès.
          Il est désormais <strong>prêt à être récupéré</strong> à notre atelier.
        </p>

    
        <p style="margin:0 0 20px;color:#374151;">
          Vous pouvez consulter vos réparations et vos factures depuis votre espace client en ligne.
        </p>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;border-radius:10px;padding:12px 28px;font-weight:700;font-size:15px;">
            Mon espace client →
          </a>
        </div>

        <p style="font-size:12px;color:#9ca3af;margin:0;">
          Si vous avez des questions, n'hésitez pas à nous contacter.
        </p>
      </div>
      <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px;">
        TechDoctor — Service de réparation
      </p>
    </div>
  `;

  const text = `Bonjour ${nom},\n\nVotre appareil ${appareilStr} a été réparé avec succès et est prêt à être récupéré.\n\nRéparation #${reparationId}\n\nConsultez votre espace client : ${appUrl}\n\nCordialement,\nL'équipe TechDoctor`;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Votre appareil est prêt à être récupéré – TechDoctor',
    text,
    html
  });
};

exports.sendVideoReadyEmail = async ({ to, nom, appareil, reparationId, videoUrl }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP non configuré.');
  }

  const appareilStr = appareil || 'votre appareil';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px 14px 0 0;padding:32px 28px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Votre vidéo récap est prête 🎬</h1>
        <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">TechDoctor — Service de réparation</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:0 0 14px 14px;padding:28px;">
        <p style="margin:0 0 16px;">Bonjour <strong>${nom}</strong>,</p>
        <p style="margin:0 0 20px;color:#374151;">
          Voici un court récapitulatif vidéo et audio de la réparation de votre appareil
          <strong>${appareilStr}</strong>, généré spécialement pour vous.
        </p>

        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;width:130px;">Appareil</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${appareilStr}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Référence</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">#${reparationId}</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="${videoUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;border-radius:10px;padding:12px 28px;font-weight:700;font-size:15px;">
            ▶ Voir ma vidéo récap
          </a>
        </div>

        <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">
          Lien direct : <a href="${videoUrl}" style="color:#7c3aed;">${videoUrl}</a>
        </p>
      </div>
      <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px;">
        TechDoctor — Service de réparation
      </p>
    </div>
  `;

  const text = `Bonjour ${nom},\n\nVotre vidéo récap de la réparation #${reparationId} (${appareilStr}) est prête.\n\nRegardez-la ici : ${videoUrl}\n\nCordialement,\nL'équipe TechDoctor`;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: 'Votre vidéo récap de réparation est prête 🎬 – TechDoctor',
    text,
    html
  });
};

exports.sendDevisEmail = async ({ to, nom, numero, montantTotal, lien }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP non configuré.');
  }

  const montant = Number(montantTotal || 0).toFixed(2);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px 14px 0 0;padding:32px 28px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Devis de réparation</h1>
        <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">TechDoctor — Validation requise</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:0 0 14px 14px;padding:28px;">
        <p style="margin:0 0 16px;">Bonjour <strong>${nom}</strong>,</p>
        <p style="margin:0 0 20px;color:#374151;">
          Un devis a été établi pour la réparation de votre appareil.
          Votre validation est nécessaire avant la poursuite des travaux.
        </p>

        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;width:160px;">Référence</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${numero}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Montant total</td>
              <td style="padding:6px 0;font-weight:600;color:#1e1b4b;">${montant} TND</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="${lien}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;border-radius:10px;padding:12px 28px;font-weight:700;font-size:15px;">
            Consulter le devis →
          </a>
        </div>

        <p style="font-size:12px;color:#9ca3af;margin:0;">
          Ce lien vous permet d'accepter ou de refuser le devis sans connexion.
        </p>
      </div>
      <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px;">
        TechDoctor — Service de réparation
      </p>
    </div>
  `;

  const text = `Bonjour ${nom},\n\nUn devis de réparation (${numero}) est disponible pour validation.\n\nMontant total : ${montant} TND\n\nConsultez et répondez ici : ${lien}\n\nCordialement,\nL'équipe TechDoctor`;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Devis de réparation ${numero} — Validation requise`,
    text,
    html
  });
};

exports.sendTestEmail = async (to) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP non configuré. Vérifiez SMTP_HOST, SMTP_PORT, SMTP_USER et SMTP_PASS.');
  }
  const mailOptions = { from: fromAddress, to, ...buildTestContent() };
  await transporter.sendMail(mailOptions);
};
