const mongoose = require('mongoose');

const stockPriceSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  change: Number,
  changePercent: Number,
  volume: Number,
  marketCap: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('StockPrice', stockPriceSchema);