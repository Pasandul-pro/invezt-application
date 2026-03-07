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
        const currencyRes = await axios.get('https://open.er-api.com/v6/latest/USD');
        const lkrRate = currencyRes.data.rates.LKR;

        const cseRes = await axios.post('https://www.cse.lk/api/marketSummery', {}, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
        });

        const marketData = cseRes.data.reqMarketSummery || [];
        const aspi = marketData.find(idx => idx.indexName === 'ASPI') || { currentValue: 0, percentageChange: 0 };
        const sp20 = marketData.find(idx => idx.indexName === 'S&P SL20') || { currentValue: 0, percentageChange: 0 };

        res.json({
            usdToLkr: lkrRate.toFixed(2),
            aspi: { value: aspi.currentValue.toLocaleString('en-US'), change: aspi.percentageChange, isPositive: aspi.percentageChange >= 0 },
            sp20: { value: sp20.currentValue.toLocaleString('en-US'), change: sp20.percentageChange, isPositive: sp20.percentageChange >= 0 }
        });
    } catch (error) {
        console.error("❌ Error fetching live market data:", error.message);
        res.json({
            usdToLkr: "310.28",
            aspi: { value: "22,443.39", change: -1.85, isPositive: false },
            sp20: { value: "6,313.65", change: -4.86, isPositive: false }
        });
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