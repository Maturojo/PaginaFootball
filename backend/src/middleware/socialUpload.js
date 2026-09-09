const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.quicktime', '.m4v'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isImage = file.mimetype.startsWith('image/') || ALLOWED_IMAGE_EXTS.includes(ext);
  const isVideo = file.mimetype.startsWith('video/') || ALLOWED_VIDEO_EXTS.includes(ext);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo imágenes y videos.'), false);
  }
};

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
    params: async (req, file) => {
      const isVideo = file.mimetype.startsWith('video/');
      return {
        folder: 'liga-football-mdp/social',
        resource_type: isVideo ? 'video' : 'image',
        allowed_formats: isVideo ? ['mp4', 'webm', 'mov'] : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      };
    },
  });

  module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 35 * 1024 * 1024 }, // 35MB
  });
} else {
  const uploadDir = path.join(__dirname, '../uploads');
  try { fs.mkdirSync(uploadDir, { recursive: true }); } catch {}

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).slice(2);
      cb(null, 'social-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 35 * 1024 * 1024 },
  });
}
