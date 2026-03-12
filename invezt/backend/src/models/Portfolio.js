import mongoose from 'mongoose';

const portfolioHoldingSchema = new mongoose.Schema({
  companyTicker: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true
  },
  shares: {
    type: Number,
    required: true,
    min: 0
  },
  averageCost: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
});

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Portfolio'
  },
  holdings: [portfolioHoldingSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
