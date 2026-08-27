const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, default: '' },
  precio: { type: Number, required: true },
  imagen: { type: String, default: '' },
  imagenes: [{ type: String }],
  categoria: { type: String, default: 'Indumentaria' },
  stock: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  whatsapp: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
