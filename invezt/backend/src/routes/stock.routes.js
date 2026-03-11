import express from 'express';
import Stock from '../models/Stock.js';
import realTimeStockService from '../services/realTimeStockService.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ── CSE real-time endpoints (public) ─────────────────────────────────────────

// GET /api/stocks/market/snapshot — full CSE market snapshot
router.get('/market/snapshot', async (req, res) => {
  try {
    const snapshot = await realTimeStockService.getMarketSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stocks/realtime/:symbol — live info for one stock from CSE
router.get('/realtime/:symbol', async (req, res) => {
  try {
    const info = await realTimeStockService.getStockInfo(req.params.symbol);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stocks/quote/:symbol — quick price+volume quote used by Analyzer
router.get('/quote/:symbol', async (req, res) => {
  try {
    const info = await realTimeStockService.getStockInfo(req.params.symbol);
    res.json({
      symbol: info.symbol,
      currentPrice: info.lastTradedPrice,
      change: info.change,
      changePercentage: info.changePercentage,
      volume: info.volume ?? null,
      marketCap: info.marketCap ?? null
    });
  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Could not fetch live quote from CSE' });
  }
});

// ── DB-backed stock endpoints (protected) ────────────────────────────────────

// GET /api/stocks — all manually-added stocks from MongoDB (Dashboard stock list)
router.get('/', protect, async (req, res) => {
  try {
    const stocks = await Stock.find({}).sort({ ticker: 1 });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/stocks — add a new stock manually
router.post('/', protect, async (req, res) => {
  try {
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json({ success: true, data: stock });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/stocks/:id — update a stock
router.put('/:id', protect, async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/stocks/:id — delete a stock
router.delete('/:id', protect, async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json({ success: true, message: 'Stock deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stocks/:ticker — single stock from DB
router.get('/:ticker', protect, async (req, res) => {
  try {
    const stock = await Stock.findOne({ ticker: req.params.ticker.toUpperCase() });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
