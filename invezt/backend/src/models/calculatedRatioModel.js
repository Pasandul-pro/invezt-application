import mongoose from 'mongoose';

const calculatedRatioSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  financialDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialDocument'
  },
  calculationTimestamp: {
    type: Date,
    default: Date.now
  },
  period: {
    fiscalYear: Number,
    quarter: Number
  },
  ratios: {
    pe: Number,
    pb: Number,
    roe: Number,
    roa: Number,
    debtToEquity: Number,
    currentRatio: Number,
    quickRatio: Number,
    eps: Number,
    dividendYield: Number,
    peg: Number
  }
}, {
  timestamps: true
});

const CalculatedRatio = mongoose.model('CalculatedRatio', calculatedRatioSchema);
export default CalculatedRatio;