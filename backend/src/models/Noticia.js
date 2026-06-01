const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  imagen: { type: String, default: '' },
  autor: { type: String, default: 'Liga Football MDP' },
  destacada: { type: Boolean, default: false },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Noticia', noticiaSchema);
