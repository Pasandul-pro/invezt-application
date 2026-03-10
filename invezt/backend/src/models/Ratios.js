const mongoose = require('mongoose');

const ratioSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  peRatio: { type: Number, required: true },
  roe: { type: Number },
  debtToEquity: { type: Number },
  date: { type: Date, default: Date.now },
  eps: { type: Number },        // Earnings Per Share
  pbRatio: { type: Number },    // Price to Book
  currentRatio: { type: Number } // Current Ratio
});

module.exports = mongoose.model('FinancialRatio', ratioSchema);