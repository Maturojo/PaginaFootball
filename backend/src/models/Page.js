const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  contenido: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);
