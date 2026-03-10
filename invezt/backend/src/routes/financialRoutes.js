const express = require('express');
const router = express.Router();
const calculationService = require('../services/calculationService');
const CalculatedRatio = require('../models/calculatedRatioModel');

// Simple auth middleware (replace with real auth later)
const auth = (req, res, next) => {
  // For now, just add a mock user
  req.user = { id: 'temp-user-123' };
  next();
};

/**
 * @route   GET /api/financial/live/:symbol
 * @desc    Get live ratios for a stock
 * @access  Public (with auth)
 */
router.get('/live/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ 
        success: false, 
        error: 'Symbol is required' 
      });
    }

    const data = await calculationService.getRealTimeRatios(symbol.toUpperCase());
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/financial/ratios/:symbol
 * @desc    Get historical ratios for a stock
 * @access  Public (with auth)
 */
router.get('/ratios/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const ratios = await CalculatedRatio.find({ 
      symbol: symbol.toUpperCase() 
    })
    .sort({ calculationTimestamp: -1 })
    .limit(limit);

    res.json({
      success: true,
      count: ratios.length,
      data: ratios
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/financial/calculate/:symbol
 * @desc    Manually trigger calculation for a stock
 * @access  Public (with auth)
 */
router.post('/calculate/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const result = await calculationService.calculateForStock(symbol.toUpperCase());
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'No financial data found for this symbol'
      });
    }

    res.json({
      success: true,
      data: result,
      message: `Successfully calculated ratios for ${symbol}`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/financial/health
 * @desc    Check if financial service is working
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Financial ratios service is running',
    endpoints: [
      'GET /api/financial/live/:symbol',
      'GET /api/financial/ratios/:symbol',
      'POST /api/financial/calculate/:symbol'
    ],
    availableRatios: [
      'P/E Ratio',
      'P/B Ratio',
      'ROE',
      'ROA',
      'Debt-to-Equity',
      'Current Ratio',
      'Quick Ratio',
      'EPS',
      'Dividend Yield',
      'PEG Ratio'
    ]
  });
});

module.exports = router;