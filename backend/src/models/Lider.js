const mongoose = require('mongoose');

const liderSchema = new mongoose.Schema({
  temporada: { type: String, required: true },
  tipo: { type: String, required: true }, // pase, corrida, recepcion, flags, intercepciones, sacks, deflecciones
  jugadores: [{ type: mongoose.Schema.Types.Mixed }],
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Lider', liderSchema);
