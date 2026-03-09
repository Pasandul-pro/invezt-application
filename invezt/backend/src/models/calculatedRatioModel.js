const mongoose = require('mongoose');

const calculatedRatioSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  financialDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialDocument'
  },
  period: {
    fiscalYear: Number,
    quarter: Number
  },
  ratios: {
    pe: Number,           // Price to Earnings
    pb: Number,           // Price to Book
    roe: Number,          // Return on Equity (%)
    roa: Number,          // Return on Assets (%)
    debtToEquity: Number, // Debt to Equity
    currentRatio: Number, // Current Ratio
    quickRatio: Number,   // Quick Ratio
    eps: Number,          // Earnings Per Share
    dividendYield: Number,// Dividend Yield (%)
    peg: Number           // PEG Ratio
  },
  calculationTimestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CalculatedRatio', calculatedRatioSchema);