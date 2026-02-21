// controllers/portfolioController.js
const Portfolio = require('../models/Portfolio');
const axios = require('axios');

/**
 * Helper function to fetch current stock prices
 * Replace with actual CSE API or data source
 */
const fetchCurrentPrices = async (tickers) => {
  try {
    // Mock implementation - replace with actual API call
    const prices = {};
    for (const ticker of tickers) {
      // Simulated API call
      prices[ticker] = Math.random() * 200 + 50; // Random price between 50-250
    }
    return prices;
  } catch (error) {
    console.error('Error fetching stock prices:', error);
    return {};
  }
};

/**
 * Get all portfolios for a user
 * GET /api/portfolios
 */
exports.getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ 
      userId: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Fetch current prices for all holdings
    const allTickers = new Set();
    portfolios.forEach(portfolio => {
      portfolio.holdings.forEach(holding => {
        allTickers.add(holding.companyTicker);
      });
    });

    const currentPrices = await fetchCurrentPrices(Array.from(allTickers));

    // Update portfolio metrics
    for (const portfolio of portfolios) {
      await portfolio.calculateMetrics(currentPrices);
    }

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolios',
      error: error.message
    });
  }
};

/**
 * Get a single portfolio by ID
 * GET /api/portfolios/:id
 */
exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Fetch current prices
    const tickers = portfolio.holdings.map(h => h.companyTicker);
    const currentPrices = await fetchCurrentPrices(tickers);

    // Calculate and attach current prices to holdings
    const enrichedHoldings = portfolio.holdings.map(holding => {
      const currentPrice = currentPrices[holding.companyTicker] || holding.averageCost;
      const currentValue = holding.shares * currentPrice;
      const totalCost = holding.shares * holding.averageCost;
      const gainLoss = currentValue - totalCost;
      const gainLossPercent = (gainLoss / totalCost) * 100;

      return {
        ...holding.toObject(),
        currentPrice,
        currentValue,
        totalCost,
        gainLoss,
        gainLossPercent: gainLossPercent.toFixed(2),
        isProfit: gainLoss >= 0
      };
    });

    // Update portfolio metrics
    await portfolio.calculateMetrics(currentPrices);

    res.status(200).json({
      success: true,
      data: {
        ...portfolio.toObject(),
        holdings: enrichedHoldings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio',
      error: error.message
    });
  }
};

/**
 * Create a new portfolio
 * POST /api/portfolios
 */
exports.createPortfolio = async (req, res) => {
  try {
    const { name, holdings, currency } = req.body;

    const portfolio = new Portfolio({
      userId: req.user.id,
      name: name || 'My Portfolio',
      holdings: holdings || [],
      currency: currency || 'LKR'
    });

    await portfolio.save();

    // Calculate initial metrics if holdings exist
    if (holdings && holdings.length > 0) {
      const tickers = holdings.map(h => h.companyTicker);
      const currentPrices = await fetchCurrentPrices(tickers);
      await portfolio.calculateMetrics(currentPrices);
    }

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating portfolio',
      error: error.message
    });
  }
};

/**
 * Update portfolio details
 * PUT /api/portfolios/:id
 */
exports.updatePortfolio = async (req, res) => {
  try {
    const { name, currency } = req.body;

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    if (name) portfolio.name = name;
    if (currency) portfolio.currency = currency;

    await portfolio.save();

    res.status(200).json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating portfolio',
      error: error.message
    });
  }
};

/**
 * Delete portfolio (soft delete)
 * DELETE /api/portfolios/:id
 */
exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    portfolio.isActive = false;
    await portfolio.save();

    res.status(200).json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting portfolio',
      error: error.message
    });
  }
};

/**
 * Add holding to portfolio
 * POST /api/portfolios/:id/holdings
 */
exports.addHolding = async (req, res) => {
  try {
    const { companyTicker, companyName, shares, averageCost, purchaseDate, sector, notes } = req.body;

    // Validation
    if (!companyTicker || !companyName || !shares || !averageCost) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: companyTicker, companyName, shares, averageCost'
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Add holding
    await portfolio.addOrUpdateHolding({
      companyTicker: companyTicker.toUpperCase(),
      companyName,
      shares: Number(shares),
      averageCost: Number(averageCost),
      purchaseDate: purchaseDate || Date.now(),
      sector: sector || 'Unknown',
      notes: notes || ''
    });

    // Add transaction record
    await portfolio.addTransaction({
      type: 'BUY',
      companyTicker: companyTicker.toUpperCase(),
      companyName,
      shares: Number(shares),
      pricePerShare: Number(averageCost),
      totalAmount: Number(shares) * Number(averageCost),
      transactionDate: purchaseDate || Date.now(),
      fees: 0,
      notes: notes || ''
    });

    // Recalculate metrics
    const tickers = portfolio.holdings.map(h => h.companyTicker);
    const currentPrices = await fetchCurrentPrices(tickers);
    await portfolio.calculateMetrics(currentPrices);

    res.status(200).json({
      success: true,
      message: 'Holding added successfully',
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding holding',
      error: error.message
    });
  }
};

/**
 * Update holding in portfolio
 * PUT /api/portfolios/:id/holdings/:ticker
 */
exports.updateHolding = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { shares, averageCost, notes } = req.body;

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const holding = portfolio.holdings.find(
      h => h.companyTicker === ticker.toUpperCase()
    );

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found'
      });
    }

    if (shares !== undefined) holding.shares = Number(shares);
    if (averageCost !== undefined) holding.averageCost = Number(averageCost);
    if (notes !== undefined) holding.notes = notes;

    await portfolio.save();

    // Recalculate metrics
    const tickers = portfolio.holdings.map(h => h.companyTicker);
    const currentPrices = await fetchCurrentPrices(tickers);
    await portfolio.calculateMetrics(currentPrices);

    res.status(200).json({
      success: true,
      message: 'Holding updated successfully',
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating holding',
      error: error.message
    });
  }
};

/**
 * Remove holding from portfolio
 * DELETE /api/portfolios/:id/holdings/:ticker
 */
exports.removeHolding = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { sharesToRemove } = req.body;

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const holding = portfolio.holdings.find(
      h => h.companyTicker === ticker.toUpperCase()
    );

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found'
      });
    }

    const shares = sharesToRemove || holding.shares;

    // Add sell transaction
    const currentPrices = await fetchCurrentPrices([ticker]);
    const sellPrice = currentPrices[ticker.toUpperCase()] || holding.averageCost;

    await portfolio.addTransaction({
      type: 'SELL',
      companyTicker: ticker.toUpperCase(),
      companyName: holding.companyName,
      shares: Number(shares),
      pricePerShare: sellPrice,
      totalAmount: Number(shares) * sellPrice,
      transactionDate: Date.now(),
      fees: 0,
      notes: 'Sold shares'
    });

    // Remove shares
    await portfolio.removeShares(ticker.toUpperCase(), Number(shares));

    // Recalculate metrics
    const tickers = portfolio.holdings.map(h => h.companyTicker);
    const updatedPrices = await fetchCurrentPrices(tickers);
    await portfolio.calculateMetrics(updatedPrices);

    res.status(200).json({
      success: true,
      message: 'Holding removed successfully',
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error removing holding',
      error: error.message
    });
  }
};

/**
 * Get portfolio transactions
 * GET /api/portfolios/:id/transactions
 */
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, ticker } = req.query;

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    let transactions = portfolio.transactions;

    // Filter by type
    if (type) {
      transactions = transactions.filter(t => t.type === type.toUpperCase());
    }

    // Filter by ticker
    if (ticker) {
      transactions = transactions.filter(
        t => t.companyTicker === ticker.toUpperCase()
      );
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => b.transactionDate - a.transactionDate);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedTransactions.length,
      total: transactions.length,
      page: Number(page),
      pages: Math.ceil(transactions.length / limit),
      data: paginatedTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

/**
 * Get portfolio performance over time
 * GET /api/portfolios/:id/performance
 */
exports.getPerformance = async (req, res) => {
  try {
    const { period = '1M' } = req.query; // 1W, 1M, 3M, 6M, 1Y, ALL

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch(period) {
      case '1W':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'ALL':
        startDate = new Date(portfolio.createdAt);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Filter transactions within date range
    const relevantTransactions = portfolio.transactions.filter(
      t => t.transactionDate >= startDate && t.transactionDate <= endDate
    );

    // Calculate performance metrics
    const performanceData = {
      period,
      startDate,
      endDate,
      totalTransactions: relevantTransactions.length,
      buyTransactions: relevantTransactions.filter(t => t.type === 'BUY').length,
      sellTransactions: relevantTransactions.filter(t => t.type === 'SELL').length,
      currentValue: portfolio.currentValue,
      totalInvestment: portfolio.totalInvestment,
      totalGainLoss: portfolio.totalGainLoss,
      totalGainLossPercent: portfolio.totalGainLossPercent,
      bestPerforming: null,
      worstPerforming: null
    };

    // Get current prices for all holdings
    const tickers = portfolio.holdings.map(h => h.companyTicker);
    const currentPrices = await fetchCurrentPrices(tickers);

    // Calculate individual holding performance
    const holdingsPerformance = portfolio.holdings.map(holding => {
      const currentPrice = currentPrices[holding.companyTicker] || holding.averageCost;
      const currentValue = holding.shares * currentPrice;
      const totalCost = holding.shares * holding.averageCost;
      const gainLoss = currentValue - totalCost;
      const gainLossPercent = (gainLoss / totalCost) * 100;

      return {
        ticker: holding.companyTicker,
        name: holding.companyName,
        gainLossPercent: gainLossPercent.toFixed(2),
        gainLoss
      };
    }).sort((a, b) => b.gainLossPercent - a.gainLossPercent);

    if (holdingsPerformance.length > 0) {
      performanceData.bestPerforming = holdingsPerformance[0];
      performanceData.worstPerforming = holdingsPerformance[holdingsPerformance.length - 1];
    }

    res.status(200).json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching performance data',
      error: error.message
    });
  }
};

/**
 * Get portfolio summary/dashboard
 * GET /api/portfolios/summary
 */
exports.getPortfolioSummary = async (req, res) => {
  try {
    const summary = await Portfolio.getPortfolioSummary(req.user.id);

    // Get all active portfolios
    const portfolios = await Portfolio.find({ 
      userId: req.user.id,
      isActive: true 
    });

    // Aggregate all holdings
    const allHoldings = [];
    const sectorAllocation = {};

    portfolios.forEach(portfolio => {
      portfolio.holdings.forEach(holding => {
        allHoldings.push(holding);
        
        if (sectorAllocation[holding.sector]) {
          sectorAllocation[holding.sector] += holding.shares * holding.averageCost;
        } else {
          sectorAllocation[holding.sector] = holding.shares * holding.averageCost;
        }
      });
    });

    // Calculate sector percentages
    const totalValue = Object.values(sectorAllocation).reduce((a, b) => a + b, 0);
    const sectorPercentages = {};
    Object.keys(sectorAllocation).forEach(sector => {
      sectorPercentages[sector] = ((sectorAllocation[sector] / totalValue) * 100).toFixed(2);
    });

    summary.sectorAllocation = sectorPercentages;
    summary.totalHoldings = allHoldings.length;

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio summary',
      error: error.message
    });
  }
};

