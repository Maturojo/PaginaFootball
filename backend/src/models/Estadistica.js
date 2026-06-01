const mongoose = require('mongoose');

const filaSchema = new mongoose.Schema({
  equipo: { type: String, required: true },
  PJ: { type: Number, default: 0 },
  PG: { type: Number, default: 0 },
  PP: { type: Number, default: 0 },
  PF: { type: Number, default: 0 },
  PC: { type: Number, default: 0 },
  Pts: { type: Number, default: 0 },
}, { _id: false });

const estadisticaSchema = new mongoose.Schema({
  temporada: { type: String, required: true },
  categoria: { type: String, required: true },
  descripcion: { type: String, default: '' },
  tabla: [filaSchema],
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Estadistica', estadisticaSchema);
