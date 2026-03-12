const Portfolio = require('../models/Portfolio');
const cseApi = require('../services/cseApi');

/**
 * Get all portfolios for current user
 */
exports.getPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ user: req.user.id });
        res.json({
            success: true,
            data: portfolios
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Create new portfolio entry
 */
exports.createPortfolio = async (req, res) => {
    try {
        const { symbol, quantity, buyPrice } = req.body;
        
        // Check if already exists
        const existing = await Portfolio.findOne({
            user: req.user.id,
            symbol: symbol.toUpperCase()
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Stock already in portfolio'
            });
        }
        
        const portfolio = await Portfolio.create({
            user: req.user.id,
            symbol: symbol.toUpperCase(),
            quantity,
            buyPrice
        });
        
        res.status(201).json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get single portfolio by ID
 */
exports.getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }
        
        // Update price before returning
        await portfolio.updateCurrentPrice();
        
        res.json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update portfolio
 */
exports.updatePortfolio = async (req, res) => {
    try {
        const { quantity, buyPrice } = req.body;
        
        const portfolio = await Portfolio.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { quantity, buyPrice, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }
        
        res.json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete portfolio
 */
exports.deletePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Portfolio deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get portfolio summary with live prices
 */
exports.getPortfolioSummary = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ user: req.user.id });
        
        // Update prices (but don't fail if API is down)
        const cseApi = require('../services/cseApi');
        const allPrices = await cseApi.getAllStockPrices();
        
        let totalInvestment = 0;
        let totalCurrent = 0;
        const holdings = [];
        
        for (const portfolio of portfolios) {
            const stockData = allPrices[portfolio.symbol];
            
            if (stockData) {
                portfolio.currentPrice = stockData.price;
                portfolio.profitLoss = (stockData.price - portfolio.buyPrice) * portfolio.quantity;
            }
            
            const investment = portfolio.buyPrice * portfolio.quantity;
            const current = portfolio.currentPrice ? portfolio.currentPrice * portfolio.quantity : null;
            
            totalInvestment += investment;
            if (current) totalCurrent += current;
            
            holdings.push({
                id: portfolio._id,
                symbol: portfolio.symbol,
                quantity: portfolio.quantity,
                buyPrice: portfolio.buyPrice,
                currentPrice: portfolio.currentPrice,
                investment,
                currentValue: current,
                profitLoss: portfolio.profitLoss,
                profitLossPercentage: portfolio.profitLossPercentage,
                dayChange: stockData?.change || null
            });
        }
        
        const totalProfitLoss = totalCurrent - totalInvestment;
        const totalProfitLossPercentage = totalInvestment > 0 
            ? (totalProfitLoss / totalInvestment) * 100 
            : 0;
        
        res.json({
            success: true,
            data: {
                holdings,
                summary: {
                    totalInvestment: Number(totalInvestment.toFixed(2)),
                    totalCurrentValue: Number(totalCurrent.toFixed(2)),
                    totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
                    totalProfitLossPercentage: Number(totalProfitLossPercentage.toFixed(2)),
                    numberOfStocks: portfolios.length,
                    lastUpdated: portfolios.length > 0 
                        ? new Date(Math.max(...portfolios.map(p => p.updatedAt)))
                        : null
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Manually refresh prices
 */
exports.refreshPrices = async (req, res) => {
    try {
        const result = await Portfolio.updateAllPrices(req.user.id);
        
        res.json({
            success: true,
            message: `Updated ${result.updated} stocks, ${result.failed} failed`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};