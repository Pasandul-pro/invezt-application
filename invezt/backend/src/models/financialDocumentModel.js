import mongoose from 'mongoose';

const financialDocumentSchema = new mongoose.Schema({
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
  documentType: {
    type: String,
    enum: ['annual', 'quarterly', 'interim'],
    required: true
  },
  period: {
    fiscalYear: Number,
    quarter: Number,
    periodEndDate: Date
  },
  source: {
    type: String,
    default: 'CSE'
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  revenue: Number,
  netIncome: Number,
  totalAssets: Number,
  totalLiabilities: Number,
  shareholdersEquity: Number,
  currentAssets: Number,
  currentLiabilities: Number,
  inventory: Number,
  eps: Number,
  bookValuePerShare: Number,
  dividendPerShare: Number,
  totalDebt: Number,
  outstandingShares: Number
}, {
  timestamps: true
});

const FinancialDocument = mongoose.model('FinancialDocument', financialDocumentSchema);
export default FinancialDocument;