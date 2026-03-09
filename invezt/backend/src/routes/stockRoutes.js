const express = require('express');
const router = express.Router();
const realTimeStockService = require('../services/realTimeStockService');
const StockPrice = require('../models/stockPriceModel');

// Simple auth middleware (reuse what you already have)
const auth = (req, res, next) => {
  req.user = { id: 'temp-user-123' };
  next();
};

/**
 * @route   GET /api/stocks/realtime/:symbol
 * @desc    Get real-time stock info by symbol
 */
router.get('/realtime/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await realTimeStockService.getStockInfo(symbol.toUpperCase());
    
    // Save price to database for historical tracking
    await realTimeStockService.saveStockPrice(
      data.symbol,
      data.lastTradedPrice,
      data.change,
      data.changePercentage,
      null, // volume if available
      data.marketCap
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/stocks/market/snapshot
 * @desc    Get complete market snapshot (indices, gainers, losers)
 */
router.get('/market/snapshot', auth, async (req, res) => {
  try {
    const snapshot = await realTimeStockService.getMarketSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/stocks/market/gainers
 * @desc    Get top gainers
 */
router.get('/market/gainers', auth, async (req, res) => {
  try {
    const gainers = await realTimeStockService.getTopGainers();
    res.json({
      success: true,
      count: gainers?.length || 0,
      data: gainers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/stocks/market/losers
 * @desc    Get top losers
 */
router.get('/market/losers', auth, async (req, res) => {
  try {
    const losers = await realTimeStockService.getTopLosers();
    res.json({
      success: true,
      count: losers?.length || 0,
      data: losers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/stocks/market/active
 * @desc    Get most active trades
 */
router.get('/market/active', auth, async (req, res) => {
  try {
    const active = await realTimeStockService.getMostActive();
    res.json({
      success: true,
      count: active?.length || 0,
      data: active
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/stocks/market/indices
 * @desc    Get ASPI and SNP indices
 */
router.get('/market/indices', auth, async (req, res) => {
  try {
    const [aspi, snp] = await Promise.all([
      realTimeStockService.getASPI(),
      realTimeStockService.getSNP()
    ]);

    res.json({
      success: true,
      data: {
        aspi: aspi?.[0],
        snp: snp?.[0],
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/stocks/history/:symbol
 * @desc    Get historical price data for a stock
 */
router.get('/history/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const prices = await StockPrice.find({ symbol: symbol.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: prices.length,
      data: prices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/stocks/chart/:symbol
 * @desc    Get chart data for a stock
 */
router.get('/chart/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period } = req.query;

    const chartData = await realTimeStockService.getChartData(
      symbol.toUpperCase(),
      period || '1M'
    );

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/stocks/polling/start
 * @desc    Start real-time polling (admin only)
 */
router.post('/polling/start', auth, async (req, res) => {
  try {
    const interval = parseInt(req.query.interval) || 60;
    realTimeStockService.startRealTimePolling(interval);
    
    res.json({
      success: true,
      message: `Real-time polling started (interval: ${interval}s)`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;