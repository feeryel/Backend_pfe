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

function buildEmailContent({ login, motDePasse, role }) {
  const subject = 'Votre compte TechDoctor a été créé';
  const text = `Bonjour,\n\nUn compte utilisateur a été créé pour vous sur TechDoctor.\n\nIdentifiant : ${login}\nMot de passe : ${motDePasse}\nRôle : ${role}\n\nVous pouvez vous connecter directement avec ces identifiants.\n\nSi vous n'avez pas demandé cette création de compte, contactez votre administrateur.\n\nCordialement,\nL'équipe TechDoctor`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937;">
      <h2 style="color: #0f172a;">Compte utilisateur créé</h2>
      <p>Bonjour,</p>
      <p>Un compte <strong>TechDoctor</strong> a été créé pour vous.</p>
      <ul>
        <li><strong>Identifiant :</strong> ${login}</li>
        <li><strong>Mot de passe :</strong> ${motDePasse}</li>
        <li><strong>Rôle :</strong> ${role}</li>
      </ul>
      <p>Vous pouvez vous connecter directement avec ces identifiants.</p>
      <p>Si vous n'avez pas demandé ce compte, contactez votre administrateur.</p>
      <p style="margin-top: 24px; color: #475569;">Cordialement,<br/>L'équipe TechDoctor</p>
    </div>
  `;

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

exports.sendTestEmail = async (to) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP non configuré. Vérifiez SMTP_HOST, SMTP_PORT, SMTP_USER et SMTP_PASS.');
  }
  const mailOptions = { from: fromAddress, to, ...buildTestContent() };
  await transporter.sendMail(mailOptions);
};
