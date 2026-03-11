import mongoose from 'mongoose';

const stockPriceSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
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
}, {
  timestamps: true
});

const StockPrice = mongoose.model('StockPrice', stockPriceSchema);
export default StockPrice;