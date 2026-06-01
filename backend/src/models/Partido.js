const mongoose = require('mongoose');

const partidoSchema = new mongoose.Schema({
  jornada: { type: String, default: '' },
  categoria: { type: String, required: true },
  equipoLocal: { type: String, required: true },
  equipoVisitante: { type: String, required: true },
  logoLocal: { type: String, default: '' },
  logoVisitante: { type: String, default: '' },
  fecha: { type: Date, required: true },
  hora: { type: String, default: '' },
  lugar: { type: String, default: '' },
  estado: { type: String, enum: ['programado', 'en_juego', 'finalizado', 'cancelado'], default: 'programado' },
  golesLocal: { type: Number, default: null },
  golesVisitante: { type: Number, default: null },
  mvp: { type: String, default: '' },
  notas: { type: String, default: '' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Partido', partidoSchema);
