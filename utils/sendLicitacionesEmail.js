const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendLicitacionesEmail = async () => {
  const filePath = path.join(__dirname, '../data/licitaciones.json');
  if (!await fs.pathExists(filePath)) return;

  const data = await fs.readJSON(filePath);
  if (data.length === 0) return;

  const rows = data.map(d => `
    <tr>
      <td>${d.titulo}</td>
      <td>${d.entidad}</td>
      <td>${d.fecha || '-'}</td>
      <td><a href="${d.link}" target="_blank">Ver</a></td>
    </tr>
  `).join('');

  const html = `
    <h2>Licitaciones encontradas</h2>
    <table border="1" cellspacing="0" cellpadding="6">
      <thead><tr><th>Título</th><th>Entidad</th><th>Fecha</th><th>Link</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Bot Licitaciones" <${process.env.MAILER_USER}>`,
    to: process.env.MAIL_TO,
    subject: "📄 Licitaciones recientes",
    html,
  });

  console.log('📧 Email enviado con licitaciones.');
};

module.exports = { sendLicitacionesEmail };
