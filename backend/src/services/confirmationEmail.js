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

function buildNotificationMessage(inscripcion) {
  const nombre = inscripcion.nombre?.trim() || 'Sin nombre';
  const rows = [
    ['Nombre', nombre],
    ['Email', inscripcion.email],
    ['Teléfono / WhatsApp', inscripcion.telefono],
    ['Edad', inscripcion.edad || 'No informado'],
    ['Posición', inscripcion.posicion || 'No informado'],
    ['Equipo preferido', inscripcion.equipoPreferido || 'No informado'],
    ['Experiencia', inscripcion.experiencia || 'No informado'],
    ['Mensaje', inscripcion.mensaje || 'Sin mensaje'],
  ];

  return {
    subject: `Nueva inscripción - ${nombre}`,
    text: [
      'Nueva inscripción recibida desde la web.',
      '',
      ...rows.map(([label, value]) => `${label}: ${value}`),
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #172033; line-height: 1.5;">
        <h2 style="margin: 0 0 12px; color: #172033;">Nueva inscripción recibida</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
          ${rows.map(([label, value]) => `
            <tr>
              <td style="border-bottom: 1px solid #e5e7eb; padding: 8px 12px; font-weight: bold; width: 180px;">${escapeHtml(label)}</td>
              <td style="border-bottom: 1px solid #e5e7eb; padding: 8px 12px;">${escapeHtml(value)}</td>
            </tr>
          `).join('')}
        </table>
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

async function sendInscripcionNotification(inscripcion) {
  if (!isEmailConfigured()) {
    return { sent: false, reason: 'SMTP no configurado' };
  }

  const to = process.env.INSCRIPCIONES_NOTIFY_TO || process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!to) {
    return { sent: false, reason: 'Email de aviso no configurado' };
  }

  const transporter = createTransporter();
  const message = buildNotificationMessage(inscripcion);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: inscripcion.email,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return { sent: true };
}

async function sendInscripcionEmails(inscripcion) {
  const result = {
    confirmacion: { sent: false },
    aviso: { sent: false },
  };

  try {
    result.confirmacion = await sendInscripcionConfirmation(inscripcion);
  } catch (error) {
    result.confirmacion = { sent: false, reason: error.message };
  }

  try {
    result.aviso = await sendInscripcionNotification(inscripcion);
  } catch (error) {
    result.aviso = { sent: false, reason: error.message };
  }

  return result;
}

module.exports = {
  isEmailConfigured,
  sendInscripcionConfirmation,
  sendInscripcionNotification,
  sendInscripcionEmails,
};
