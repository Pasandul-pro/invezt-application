const mongoose = require('mongoose');
// News schema

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'News title is required'],
    trim: true
  },
  
  summary: {
    type: String,
    required: [true, 'News summary is required']
  },
  content: {
    type: String,
    required: [true, 'News content is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['Market News', 'Company News', 'Earnings Report', 'Economic Update', 'Regulatory'],
    default: 'Market News'
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x200'
  },
  readMoreLink: {
    type: String,
    default: '#'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('News', newsSchema);