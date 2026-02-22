const express = require('express');
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');

const router = express.Router();

// Mock user middleware (since JWT not ready yet)
const mockAuth = (req, res, next) => {
  req.user = { id: 'mock-user-123' }; // Temporary mock user
  next();
};

// Apply mock auth to all routes
router.use(mockAuth);

/**
 * @route   GET /api/portfolio
 * @desc    Get user's portfolio
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    // If no portfolio exists, create one
    if (!portfolio) {
      portfolio = new Portfolio({ 
        userId: req.user.id,
        name: 'My Portfolio'
      });
      await portfolio.save();
    }

    // Calculate latest values
    portfolio.calculateTotals();

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/portfolio/holdings
 * @desc    Add a holding to portfolio
 * @access  Private
 */
router.post('/holdings', async (req, res) => {
  try {
    const { symbol, shares, avgPrice } = req.body;

    // Validate input
    if (!symbol || !shares || !avgPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide symbol, shares, and avgPrice' 
      });
    }

    // Find stock
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock not found' 
      });
    }

    // Get or create portfolio
    let portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      portfolio = new Portfolio({ userId: req.user.id });
    }

    // Check if holding already exists
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);

    if (existingHolding) {
      // Update existing holding (average down/up)
      const totalShares = existingHolding.shares + shares;
      const totalCost = (existingHolding.shares * existingHolding.avgPrice) + (shares * avgPrice);
      
      existingHolding.shares = totalShares;
      existingHolding.avgPrice = totalCost / totalShares;
    } else {
      // Add new holding
      portfolio.holdings.push({
        stockId: stock._id,
        symbol: stock.symbol,
        companyName: stock.name,
        shares,
        avgPrice
      });
    }

    // Calculate totals
    portfolio.calculateTotals();
    await portfolio.save();

    res.json({
      success: true,
      data: portfolio,
      message: 'Holding added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/portfolio/holdings/:symbol
 * @desc    Update a holding (shares or avgPrice)
 * @access  Private
 */
router.put('/holdings/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { shares, avgPrice } = req.body;

    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({ 
        success: false, 
        message: 'Portfolio not found' 
      });
    }

    const holding = portfolio.holdings.find(h => h.symbol === symbol);

    if (!holding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Holding not found' 
      });
    }

    if (shares !== undefined) holding.shares = shares;
    if (avgPrice !== undefined) holding.avgPrice = avgPrice;

    portfolio.calculateTotals();
    await portfolio.save();

    res.json({
      success: true,
      data: portfolio,
      message: 'Holding updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/portfolio/holdings/:symbol
 * @desc    Remove a holding from portfolio
 * @access  Private
 */
router.delete('/holdings/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({ 
        success: false, 
        message: 'Portfolio not found' 
      });
    }

    portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
    portfolio.calculateTotals();
    await portfolio.save();

    res.json({
      success: true,
      data: portfolio,
      message: 'Holding removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/portfolio/value
 * @desc    Get portfolio summary with total value and gain/loss
 * @access  Private
 */
router.get('/value', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.json({
        success: true,
        data: {
          totalValue: 0,
          totalCost: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          holdings: []
        }
      });
    }

    portfolio.calculateTotals();

    res.json({
      success: true,
      data: {
        totalValue: portfolio.totalValue,
        totalCost: portfolio.totalCost,
        totalGainLoss: portfolio.totalGainLoss,
        totalGainLossPercent: portfolio.totalGainLossPercent,
        holdingsCount: portfolio.holdings.length,
        holdings: portfolio.holdings.map(h => ({
          symbol: h.symbol,
          companyName: h.companyName,
          shares: h.shares,
          avgPrice: h.avgPrice,
          currentPrice: h.currentPrice || h.avgPrice,
          totalValue: h.totalValue,
          gainLoss: h.gainLoss,
          gainLossPercent: h.gainLossPercent
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/portfolio/name
 * @desc    Update portfolio name
 * @access  Private
 */
router.put('/name', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a name' 
      });
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId: req.user.id, isActive: true },
      { name },
      { new: true }
    );

    if (!portfolio) {
      return res.status(404).json({ 
        success: false, 
        message: 'Portfolio not found' 
      });
    }

    res.json({
      success: true,
      data: portfolio,
      message: 'Portfolio name updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/portfolio/reset
 * @desc    Reset portfolio (remove all holdings)
 * @access  Private
 */
router.post('/reset', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!portfolio) {
      return res.status(404).json({ 
        success: false, 
        message: 'Portfolio not found' 
      });
    }

    portfolio.holdings = [];
    portfolio.calculateTotals();
    await portfolio.save();

    res.json({
      success: true,
      data: portfolio,
      message: 'Portfolio reset successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;