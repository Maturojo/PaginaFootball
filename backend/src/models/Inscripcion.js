const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  edad: { type: Number },
  posicion: { type: String, default: '' },
  equipoPreferido: { type: String, default: '' },
  experiencia: { type: String, default: '' },
  mensaje: { type: String, default: '' },
  estado: { type: String, enum: ['pendiente', 'contactado', 'aceptado', 'rechazado'], default: 'pendiente' },
}, { timestamps: true });

module.exports = mongoose.model('Inscripcion', inscripcionSchema);
