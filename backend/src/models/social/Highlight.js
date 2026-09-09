const mongoose = require('mongoose');

const highlightItemSchema = new mongoose.Schema({
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { _id: true });

const highlightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 40,
  },
  cover: {
    type: String,
    default: '',
  },
  items: [highlightItemSchema],
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

highlightSchema.index({ user: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model('Highlight', highlightSchema);
