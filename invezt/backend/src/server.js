// BUGFIX FOR NODE 24 ON WINDOWS: Force reliable DNS servers
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const axios = require('axios');
require('dotenv').config();

const stockRoutes = require('./routes/stockRoutes');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/stocks', stockRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to the Invezt Backend! The Kitchen is officially open.");
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
app.listen(PORT, () => {
    console.log(`🚀 Server is running beautifully on port ${PORT}`);
});