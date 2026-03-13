import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import Watchlist from "../models/Watchlist.js";
import realTimeStockService from "../services/realTimeStockService.js";

const router = express.Router();
const normalizeSymbol = (symbol) =>
  realTimeStockService.normalizeSymbol(symbol);

// All watchlist routes require authentication
router.use(protect);

/**
 * GET /api/watchlist
 * Get user's watchlist with live prices from CSE
 */
router.get("/", async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user._id });
    if (!watchlist) {
      // Return empty watchlist if none exists
      return res.json({ success: true, stocks: [] });
    }

    const quoteSnapshot = await realTimeStockService.getQuotesForSymbols(
      watchlist.stocks.map((item) => item.symbol),
      {
        maxAgeMs: 10 * 60 * 1000,
        allowStaleCache: true,
        allowStoredFallback: true,
        allowSimulatedFallback: false,
      },
    );

    const quoteMap = quoteSnapshot.quoteMap || new Map();
    const enrichedStocks = watchlist.stocks.map((item) => {
      const quote = quoteMap.get(normalizeSymbol(item.symbol)) || null;
      return {
        symbol: item.symbol,
        companyName: item.companyName || item.symbol,
        addedAt: item.addedAt,
        currentPrice: quote?.lastTradedPrice ?? null,
        change: quote?.change ?? null,
        changePercentage: quote?.changePercentage ?? null,
        priceSource: quote?.source || "unavailable",
        priceAsOf: quote?.priceAsOf || null,
        priceStale: quote?.stale || false,
      };
    });

    res.json({
      success: true,
      stocks: enrichedStocks,
      pricesUpdatedAt: quoteSnapshot.fetchedAt,
      priceSource: quoteSnapshot.source,
      priceStale: quoteSnapshot.stale,
      refreshIntervalMinutes: 10,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching watchlist",
      error: error.message,
    });
  }
});

/**
 * POST /api/watchlist
 * Add a stock to watchlist
 * Body: { symbol, companyName }
 */
router.post("/", async (req, res) => {
  try {
    const { symbol, companyName } = req.body;
    if (!symbol)
      return res
        .status(400)
        .json({ success: false, message: "symbol is required" });

    const sym = normalizeSymbol(symbol);
    let watchlist = await Watchlist.findOne({ userId: req.user._id });

    if (!watchlist) {
      watchlist = new Watchlist({ userId: req.user._id, stocks: [] });
    }

    // Prevent duplicates
    const exists = watchlist.stocks.some(
      (s) => normalizeSymbol(s.symbol) === sym,
    );
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `${sym} is already in your watchlist`,
      });
    }

    watchlist.stocks.push({ symbol: sym, companyName: companyName || sym });
    await watchlist.save();

    res.status(201).json({
      success: true,
      message: `${sym} added to watchlist`,
      data: watchlist,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding to watchlist",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/watchlist/:symbol
 * Remove a stock from watchlist
 */
router.delete("/:symbol", async (req, res) => {
  try {
    const sym = normalizeSymbol(req.params.symbol);
    const watchlist = await Watchlist.findOne({ userId: req.user._id });

    if (!watchlist)
      return res
        .status(404)
        .json({ success: false, message: "Watchlist not found" });

    const initialCount = watchlist.stocks.length;
    watchlist.stocks = watchlist.stocks.filter(
      (s) => normalizeSymbol(s.symbol) !== sym,
    );

    if (watchlist.stocks.length === initialCount) {
      return res
        .status(404)
        .json({ success: false, message: `${sym} not found in watchlist` });
    }

    await watchlist.save();
    res.json({ success: true, message: `${sym} removed from watchlist` });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing from watchlist",
      error: error.message,
    });
  }
});

export default router;
