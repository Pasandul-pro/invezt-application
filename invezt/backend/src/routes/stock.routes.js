const express = require('express');
const Stock = require('../models/Stock');

const router = express.Router();

/**
 * @route   GET /api/stocks
 * @desc    Get all stocks for dropdown
 * @access  Public (will add auth later)
 */
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find({ isActive: true })
      .select('symbol name sector industry logo')
      .sort({ symbol: 1 });

    res.json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/stocks/search
 * @desc    Search stocks for dropdown/autocomplete
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 1) {
      return res.json({ success: true, data: [] });
    }

    const stocks = await Stock.find({
      $or: [
        { symbol: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .select('symbol name sector industry logo')
    .limit(10);

    res.json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/stocks/sectors
 * @desc    Get all unique sectors for filter dropdown
 * @access  Public
 */
router.get('/sectors', async (req, res) => {
  try {
    const sectors = await Stock.distinct('sector', { isActive: true });
    
    res.json({
      success: true,
      count: sectors.length,
      data: sectors.sort()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/stocks/:symbol
 * @desc    Get single stock by symbol
 * @access  Public
 */
router.get('/:symbol', async (req, res) => {
  try {
    const stock = await Stock.findOne({ 
      symbol: req.params.symbol.toUpperCase(),
      isActive: true 
    });

    if (!stock) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock not found' 
      });
    }

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;