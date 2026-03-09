// Alert model
const mongoose = require('mongoose');
// Alert schema

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Price Alert', 'Market Update', 'News Alert', 'Earnings Alert'],
    required: true
  },
  // category of alert
  category: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  relatedTicker: String,
  relatedCompany: String,
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);