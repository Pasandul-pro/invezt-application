// BUGFIX FOR NODE 24 ON WINDOWS: Force reliable DNS servers
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const connectDB = require("./config/db.js");
const authenticationMiddleware =
  require("./middlewares/authenticationMiddleware").default;

const authenticationRoutes = require("./routes/authenticationRoutes.js");
const stockRoutes = require("./routes/stockRoutes.js");
const valuationRoutes = require("./routes/valuationRoutes.js");
const financialRoutes = require("./routes/financialRoutes.js");

const cseIntegrationService = require("./services/cseIntegrationService");
const realTimeStockService = require("./services/realTimeStockService");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB and start auxiliary services
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("🔄 Starting CSE auto-polling service...");
    cseIntegrationService.startPolling();

    console.log("📊 Starting real-time stock polling...");
    realTimeStockService.startRealTimePolling(60);
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });

// Register routes
app.use("/api/auth", authenticationRoutes);
app.use("/api/stocks", authenticationMiddleware, stockRoutes);
app.use("/api/valuation", authenticationMiddleware, valuationRoutes);
app.use("/api/financial", financialRoutes);

// Health check route with consolidated information
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Invezt API is running",
    timestamp: new Date(),
    endpoints: {
      auth: "/api/auth",
      stocks: "/api/stocks",
      valuation: "/api/valuation",
      financial: "/api/financial",
      marketHighlights: "/api/market-highlights",
      quote: "/api/quote/:ticker",
      realtimeStock: "GET /api/stocks/realtime/:symbol",
      marketSnapshot: "GET /api/stocks/market/snapshot",
      topGainers: "GET /api/stocks/market/gainers",
      topLosers: "GET /api/stocks/market/losers",
      mostActive: "GET /api/stocks/market/active",
      marketIndices: "GET /api/stocks/market/indices",
      stockHistory: "GET /api/stocks/history/:symbol",
      stockChart: "GET /api/stocks/chart/:symbol",
    },
    features: {
      cseAutoDetect: "Active (checks every 5 minutes)",
      ratiosCalculated:
        "10 ratios (P/E, P/B, ROE, ROA, D/E, Current, Quick, EPS, Div Yield, PEG)",
      realTimeStocks: "Active (updates every 60 seconds)",
    },
  });
});

// MARKET HIGHLIGHTS route from HEAD
app.get("/api/market-highlights", async (req, res) => {
  try {
    const rateResponse = await fetch("https://open.er-api.com/v6/latest/USD");
    const rateData = await rateResponse.json();
    const liveLKR = rateData.rates.LKR.toFixed(2);

    res.json({
      aspi: { value: "11,450.20" },
      sp20: { value: "3,210.50" },
      usdToLkr: liveLKR,
    });
  } catch (error) {
    console.error("Error fetching live rates:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

// SMART TICKER AUTO-FETCH route from HEAD
app.get("/api/quote/:ticker", async (req, res) => {
  let rawTicker = req.params.ticker.toUpperCase().trim();
  const cseSymbol = rawTicker.includes(".") ? rawTicker : `${rawTicker}.N0000`;

  try {
    const response = await axios.post(
      "https://www.cse.lk/api/tradeSummary",
      {},
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Accept: "application/json",
        },
      },
    );

    const stockList = response.data.reqTradeSummery || [];
    if (!Array.isArray(stockList)) {
      throw new Error("CSE did not return a valid stock list format.");
    }

    const stockData = stockList.find((stock) => stock.symbol === cseSymbol);
    if (!stockData) {
      return res
        .status(404)
        .json({ message: "Ticker not found on the official CSE market." });
    }

    res.json({
      currentPrice: stockData.price || stockData.lastTradedPrice || 0,
      volume: stockData.sharevolume || stockData.tradeVolume || 0,
      isLive: true,
    });
  } catch (error) {
    console.error(
      `❌ Error connecting to CSE for ${cseSymbol}:`,
      error.message,
    );
    res
      .status(500)
      .json({ message: "Failed to connect to the Colombo Stock Exchange." });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📊 Financial ratios API: http://localhost:${PORT}/api/financial`,
  );
  console.log(`📈 Real-time stock API: http://localhost:${PORT}/api/stocks`);
  console.log(`🔄 CSE auto-polling: Active (every 5 minutes)`);
  console.log(`📊 Real-time stock polling: Active (every 60 seconds)`);
  console.log(
    `🧮 10 Ratios: P/E, P/B, ROE, ROA, D/E, Current, Quick, EPS, Div Yield, PEG`,
  );
  console.log(
    `📝 Test financial live: http://localhost:${PORT}/api/financial/live/JKH.N0000`,
  );
  console.log(
    `📝 Test stock realtime: http://localhost:${PORT}/api/stocks/realtime/JKH.N0000`,
  );
  console.log(
    `📝 Test market snapshot: http://localhost:${PORT}/api/stocks/market/snapshot`,
  );
  console.log(`📊 Valuation API: http://localhost:${PORT}/api/valuation`);
});
