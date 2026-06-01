const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  fecha: { type: Date, required: true },
  lugar: { type: String, default: '' },
  fotos: [{ type: String }],
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Evento', eventoSchema);
