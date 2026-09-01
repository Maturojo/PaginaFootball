const nodemailer = require('nodemailer');

const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildConfirmationMessage(inscripcion) {
  const nombre = inscripcion.nombre?.trim() || 'tu inscripción';
  const nombreHtml = escapeHtml(nombre);

  return {
    subject: 'Recibimos tu inscripción - Liga de Football Americano MDP',
    text: [
      `Hola ${nombre},`,
      '',
      'Tu inscripción en la Liga de Football Americano Mar del Plata se registró correctamente.',
      'Gracias por sumarte. Te vamos a escribir o llamar en cualquier momento para contarte los próximos pasos.',
      '',
      'Liga de Football Americano Mar del Plata',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #172033; line-height: 1.5;">
        <h2 style="margin: 0 0 12px; color: #172033;">Inscripción recibida</h2>
        <p>Hola ${nombreHtml},</p>
        <p>Tu inscripción en la <strong>Liga de Football Americano Mar del Plata</strong> se registró correctamente.</p>
        <p>Gracias por sumarte. Te vamos a escribir o llamar en cualquier momento para contarte los próximos pasos.</p>
        <p style="margin-top: 24px;">Liga de Football Americano Mar del Plata</p>
      </div>
    `,
  };
}

async function sendInscripcionConfirmation(inscripcion) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: 'SMTP no configurado' };
  }

  const transporter = createTransporter();
  const message = buildConfirmationMessage(inscripcion);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: inscripcion.email,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return { sent: true };
}

module.exports = {
  isEmailConfigured,
  sendInscripcionConfirmation,
};
