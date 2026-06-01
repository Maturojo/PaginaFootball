const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ciudad: { type: String, default: 'Mar del Plata' },
  descripcion: { type: String, default: '' },
  logo: { type: String, default: '' },
  colores: { type: String, default: '' },
  anioFundacion: { type: Number },
  jugadores: [{ type: String }],
  categoria: { type: String, default: 'Liga Football Flag' },
  proximamente: { type: Boolean, default: false },
  esSeleccion: { type: Boolean, default: false },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
