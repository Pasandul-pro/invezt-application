// models/Portfolio.js
const mongoose = require('mongoose');

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
  },
  sector: {
    type: String,
    default: 'Unknown'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['BUY', 'SELL', 'DIVIDEND'],
    required: true
  },
  companyTicker: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: {
    type: String,
    required: true
  },
  shares: {
    type: Number,
    required: function() {
      return this.type !== 'DIVIDEND';
    },
    min: 0
  },
  pricePerShare: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  fees: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

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
  transactions: [transactionSchema],
  totalInvestment: {
    type: Number,
    default: 0,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalGainLoss: {
    type: Number,
    default: 0
  },
  totalGainLossPercent: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR', 'GBP']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for number of unique holdings
portfolioSchema.virtual('numberOfHoldings').get(function() {
  return this.holdings.length;
});

// Virtual for total shares across all holdings
portfolioSchema.virtual('totalShares').get(function() {
  return this.holdings.reduce((sum, holding) => sum + holding.shares, 0);
});

// Index for faster queries
portfolioSchema.index({ userId: 1, isActive: 1 });
portfolioSchema.index({ 'holdings.companyTicker': 1 });

// Method to add a new holding or update existing
portfolioSchema.methods.addOrUpdateHolding = function(holdingData) {
  const existingHolding = this.holdings.find(
    h => h.companyTicker === holdingData.companyTicker
  );

  if (existingHolding) {
    // Update existing holding (average cost calculation)
    const totalCost = (existingHolding.shares * existingHolding.averageCost) + 
                      (holdingData.shares * holdingData.averageCost);
    const totalShares = existingHolding.shares + holdingData.shares;
    
    existingHolding.averageCost = totalCost / totalShares;
    existingHolding.shares = totalShares;
    existingHolding.notes = holdingData.notes || existingHolding.notes;
  } else {
    // Add new holding
    this.holdings.push(holdingData);
  }

  return this.save();
};

// Method to remove shares from holding
portfolioSchema.methods.removeShares = function(ticker, sharesToRemove) {
  const holding = this.holdings.find(h => h.companyTicker === ticker);
  
  if (!holding) {
    throw new Error('Holding not found');
  }

  if (holding.shares < sharesToRemove) {
    throw new Error('Insufficient shares to remove');
  }

  holding.shares -= sharesToRemove;

  // Remove holding if shares reach zero
  if (holding.shares === 0) {
    this.holdings = this.holdings.filter(h => h.companyTicker !== ticker);
  }

  return this.save();
};

// Method to add transaction
portfolioSchema.methods.addTransaction = function(transactionData) {
  this.transactions.push(transactionData);
  return this.save();
};

// Method to calculate portfolio metrics
portfolioSchema.methods.calculateMetrics = function(currentPrices) {
  let totalInvestment = 0;
  let currentValue = 0;

  this.holdings.forEach(holding => {
    const cost = holding.shares * holding.averageCost;
    totalInvestment += cost;

    const currentPrice = currentPrices[holding.companyTicker] || holding.averageCost;
    const value = holding.shares * currentPrice;
    currentValue += value;
  });

  this.totalInvestment = totalInvestment;
  this.currentValue = currentValue;
  this.totalGainLoss = currentValue - totalInvestment;
  this.totalGainLossPercent = totalInvestment > 0 
    ? ((this.totalGainLoss / totalInvestment) * 100) 
    : 0;
  this.lastUpdated = Date.now();

  return this.save();
};

// Static method to get portfolio summary by user
portfolioSchema.statics.getPortfolioSummary = async function(userId) {
  const portfolios = await this.find({ userId, isActive: true });
  
  const summary = {
    totalPortfolios: portfolios.length,
    totalInvestment: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    topHoldings: []
  };

  portfolios.forEach(portfolio => {
    summary.totalInvestment += portfolio.totalInvestment;
    summary.totalCurrentValue += portfolio.currentValue;
    summary.totalGainLoss += portfolio.totalGainLoss;
  });

  if (summary.totalInvestment > 0) {
    summary.totalGainLossPercent = 
      (summary.totalGainLoss / summary.totalInvestment) * 100;
  }

  return summary;
};

// Pre-save middleware to update timestamps
portfolioSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
