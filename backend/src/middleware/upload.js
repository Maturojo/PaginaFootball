const multer = require('multer');
const path = require('path');
const fs = require('fs');

// En Vercel solo /tmp es escribible. Local usamos src/uploads/
const uploadDir = process.env.LOCAL === 'true'
  ? path.join(__dirname, '../uploads')
  : '/tmp';

// Asegurar que la carpeta exista
try { fs.mkdirSync(uploadDir, { recursive: true }); } catch {}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname))
});

module.exports = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
