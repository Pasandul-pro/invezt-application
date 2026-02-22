const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    enum: ['Banking', 'Finance', 'Manufacturing', 'Telecom', 'Healthcare', 'Energy', 'Consumer', 'Technology', 'Conglomerate', 'Diversified Financials']
  },
  industry: {
    type: String,
    required: true
  },
  exchange: {
    type: String,
    default: 'CSE',
    enum: ['CSE', 'NYSE', 'NASDAQ']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD']
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/50'
  },
  description: {
    type: String,
    default: ''
  },
  website: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
stockSchema.index({ symbol: 'text', name: 'text', sector: 'text' });

module.exports = mongoose.model('Stock', stockSchema);