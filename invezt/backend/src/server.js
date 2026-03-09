// BUGFIX FOR NODE 24 ON WINDOWS: Force reliable DNS servers
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './config/db.js';
import axios from 'axios';
import dotenv from 'dotenv';
import authenticationMiddleware from './middlewares/authenticationMiddleware.js';
import authenticationRoutes from './routes/authenticationRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import valuationRoutes from './routes/valuationRoutes.js'; // NEW: Import valuation routes

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authenticationRoutes);
app.use('/api/stocks', authenticationMiddleware, stockRoutes);
app.use('/api/valuation', authenticationMiddleware, valuationRoutes); // NEW: Valuation routes with auth

// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        message: "invezt backend is running",
        status: "ok",
        endpoints: {
            auth: "/api/auth",
            stocks: "/api/stocks",
            valuation: "/api/valuation", // NEW: Added to health check
            marketHighlights: "/api/market-highlights",
            quote: "/api/quote/:ticker"
        }
    });
});

// LIVE MARKET HIGHLIGHTS ROUTE
app.get('/api/market-highlights', async (req, res) => {
    try {
        // Fetch real-time USD to LKR exchange rate from a free public API
        const rateResponse = await fetch('https://open.er-api.com/v6/latest/USD');
        const rateData = await rateResponse.json();
        const liveLKR = rateData.rates.LKR.toFixed(2);

        res.json({
            aspi: { value: '11,450.20' }, // Note: Live CSE data requires a paid API, so we simulate the ASPI/S&P for now
            sp20: { value: '3,210.50' },
            usdToLkr: liveLKR // This is now a LIVE real-world number!
        });
    } catch (error) {
        console.error("Error fetching live rates:", error);
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
});

// SMART TICKER AUTO-FETCH ROUTE
app.get('/api/quote/:ticker', async (req, res) => {
    let rawTicker = req.params.ticker.toUpperCase().trim();
    const cseSymbol = rawTicker.includes('.') ? rawTicker : `${rawTicker}.N0000`;

    try {
        const response = await axios.post('https://www.cse.lk/api/tradeSummary', {}, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            }
        });

        const stockList = response.data.reqTradeSummery || [];

        if (!Array.isArray(stockList)) {
            throw new Error("CSE did not return a valid stock list format.");
        }

        const stockData = stockList.find(stock => stock.symbol === cseSymbol);

        if (!stockData) {
            return res.status(404).json({ message: "Ticker not found on the official CSE market." });
        }

        res.json({
            currentPrice: stockData.price || stockData.lastTradedPrice || 0,
            volume: stockData.sharevolume || stockData.tradeVolume || 0,
            isLive: true
        });

    } catch (error) {
        console.error(`❌ Error connecting to CSE for ${cseSymbol}:`, error.message);
        res.status(500).json({ message: "Failed to connect to the Colombo Stock Exchange." });
    }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 Server is running beautifully on port ${PORT}`);
            console.log(`📊 Valuation API: http://localhost:${PORT}/api/valuation`);
        });
    } catch (err) {
        console.error("❌ Failed to start server: ", err.message);
        process.exit(1);
    }
};

startServer();
