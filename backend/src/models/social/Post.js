const mongoose = require('mongoose');

const postMediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String, default: '' },
  publicId: { type: String, default: '' },
}, { _id: true });

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    default: '',
    maxlength: 2500,
    trim: true,
  },
  media: [postMediaSchema],

  // Relaciones OPCIONALES con Football Core (sin modificar entidades originales)
  relatedPartido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partido',
    default: null,
    index: true,
  },
  relatedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
    index: true,
  },
  relatedJugador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    default: null,
    index: true,
  },

  tags: [{ type: String, lowercase: true, trim: true }],
  mentions: [{ type: String, lowercase: true, trim: true }],

  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  savesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },

  activo: { type: Boolean, default: true, index: true },
}, { timestamps: true });

postSchema.index({ tags: 1 });
postSchema.index({ mentions: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
