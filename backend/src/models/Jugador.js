const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  numero: { type: Number },
  posicion: { type: String, default: '' },
  equipo: { type: String, required: true },
  foto: { type: String, default: '' },
  bio: { type: String, default: '' },
  stats: {
    touchdowns: { type: Number, default: 0 },
    intercepciones: { type: Number, default: 0 },
    yardas: { type: Number, default: 0 },
    partidos: { type: Number, default: 0 },
  },
  esMVP: { type: Boolean, default: false },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Jugador', jugadorSchema);
