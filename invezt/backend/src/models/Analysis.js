const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  valuationModel: { type: String, enum: ['DCF', 'CAPM'], required: true },
  intrinsicValue: { type: Number, required: true },
  recommendation: { type: String, enum: ['Buy', 'Hold', 'Sell'] },
  starRating: { type: Number, min: 1, max: 5 },
  analysisDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalysisResult', analysisSchema);