// Devuelve la URL correcta del archivo subido
// Cloudinary: req.file.path es la URL completa (https://res.cloudinary.com/...)
// Local: req.file.filename es solo el nombre, se arma /uploads/nombre
module.exports = function fileUrl(file) {
  if (!file) return null;
  if (file.path && file.path.startsWith('http')) return file.path; // Cloudinary
  return `/uploads/${file.filename}`; // local
};
