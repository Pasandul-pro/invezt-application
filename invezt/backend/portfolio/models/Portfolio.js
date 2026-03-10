const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    buyPrice: {
        type: Number,
        required: true,
        min: 0
    },
    currentPrice: {
        type: Number,
        default: null
    },
    profitLoss: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate entries
portfolioSchema.index({ user: 1, symbol: 1 }, { unique: true });

// Update timestamps on save
portfolioSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for profit/loss percentage
portfolioSchema.virtual('profitLossPercentage').get(function() {
    if (this.buyPrice && this.currentPrice && this.buyPrice > 0) {
        return ((this.currentPrice - this.buyPrice) / this.buyPrice) * 100;
    }
    return 0;
});

// Virtual for investment value
portfolioSchema.virtual('investmentValue').get(function() {
    return this.buyPrice * this.quantity;
});

// Virtual for current value
portfolioSchema.virtual('currentValue').get(function() {
    if (this.currentPrice) {
        return this.currentPrice * this.quantity;
    }
    return null;
});

// Method to update current price
portfolioSchema.methods.updateCurrentPrice = async function() {
    const cseApi = require('../services/cseApi');
    
    try {
        const price = await cseApi.getStockPrice(this.symbol);
        
        if (price) {
            this.currentPrice = price;
            this.profitLoss = (price - this.buyPrice) * this.quantity;
            await this.save();
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error updating price for ${this.symbol}:`, error);
        return false;
    }
};

// Static method to update all portfolios
portfolioSchema.statics.updateAllPrices = async function(userId = null) {
    const query = userId ? { user: userId } : {};
    const portfolios = await this.find(query);
    
    const cseApi = require('../services/cseApi');
    const allPrices = await cseApi.getAllStockPrices();
    
    let updated = 0;
    let failed = 0;
    
    for (const portfolio of portfolios) {
        const stockData = allPrices[portfolio.symbol];
        
        if (stockData) {
            portfolio.currentPrice = stockData.price;
            portfolio.profitLoss = (stockData.price - portfolio.buyPrice) * portfolio.quantity;
            portfolio.updatedAt = Date.now();
            await portfolio.save();
            updated++;
        } else {
            failed++;
            console.log(`Symbol not found: ${portfolio.symbol}`);
        }
    }
    
    return { updated, failed, total: portfolios.length };
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;