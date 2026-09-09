const mongoose = require('mongoose');

const socialProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9._]+$/,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 300,
  },
  avatar: {
    type: String,
    default: '',
  },
  banner: {
    type: String,
    default: '',
  },
  // Vínculo opcional con la ficha deportiva de un jugador existente en Football Core
  jugadorRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  postsCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

socialProfileSchema.index({ username: 'text', displayName: 'text', bio: 'text' });

module.exports = mongoose.model('SocialProfile', socialProfileSchema);
