const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Si están configuradas las variables de Cloudinary, usarlo
if (process.env.CLOUDINARY_CLOUD_NAME) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'liga-football-mdp',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 800, crop: 'limit' }],
    },
  });

  module.exports = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
} else {
  // Fallback local
  const uploadDir = path.join(__dirname, '../uploads');
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch {}

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname))
  });

  module.exports = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
}
