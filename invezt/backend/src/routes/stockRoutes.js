
const express = require("express");
const router = express.Router();

const Stock = require("../models/Stock"); // model used for CRUD
const realTimeStockService = require("../services/realTimeStockService");
const StockPrice = require("../models/stockPriceModel");

// simple informational endpoint
router.get("/info", (req, res) => {
  res.json({
    status: "ok",
    message: "stock route",
    user: req.user,
  });
});

// === CRUD routes for stocks ===
router.post("/", async (req, res) => {
  try {
    const newStock = new Stock(req.body);
    const savedStock = await newStock.save();
    res.status(201).json({
      message: "Stock added successfully!",
      data: savedStock,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add stock",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch stocks",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedStock = await Stock.findByIdAndDelete(req.params.id);
    if (!deletedStock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(200).json({ message: "Stock deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting stock", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedStock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res
      .status(200)
      .json({ message: "Stock updated successfully!", data: updatedStock });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating stock", error: error.message });
  }
});

// === real-time and auxiliary endpoints ===
router.get("/realtime/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await realTimeStockService.getStockInfo(symbol.toUpperCase());
    await realTimeStockService.saveStockPrice(
      data.symbol,
      data.lastTradedPrice,
      data.change,
      data.changePercentage,
      null,
      data.marketCap,
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/market/snapshot", async (req, res) => {
  try {
    const snapshot = await realTimeStockService.getMarketSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/market/gainers", async (req, res) => {
  try {
    const gainers = await realTimeStockService.getTopGainers();
    res.json({ success: true, count: gainers?.length || 0, data: gainers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/market/losers", async (req, res) => {
  try {
    const losers = await realTimeStockService.getTopLosers();
    res.json({ success: true, count: losers?.length || 0, data: losers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/market/active", async (req, res) => {
  try {
    const active = await realTimeStockService.getMostActive();
    res.json({ success: true, count: active?.length || 0, data: active });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/market/indices", async (req, res) => {
  try {
    const [aspi, snp] = await Promise.all([
      realTimeStockService.getASPI(),
      realTimeStockService.getSNP(),
    ]);
    res.json({
      success: true,
      data: {
        aspi: aspi?.[0],
        snp: snp?.[0],
        timestamp: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/history/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const prices = await StockPrice.find({ symbol: symbol.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/chart/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period } = req.query;
    const chartData = await realTimeStockService.getChartData(
      symbol.toUpperCase(),
      period || "1M",
    );
    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/polling/start", async (req, res) => {
  try {
    const interval = parseInt(req.query.interval) || 60;
    realTimeStockService.startRealTimePolling(interval);
    res.json({
      success: true,
      message: `Real-time polling started (interval: ${interval}s)`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
