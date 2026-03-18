import express from 'express';
import realTimeStockService from '../services/realTimeStockService.js';

const router = express.Router();

// LKR/USD Real-time Exchange Rate Cache
let cachedRate = null;
let lastFetchTime = 0;
const FASTFOREX_API_URL = "https://api.fastforex.io/fetch-one?from=USD&to=LKR&api_key=2fd79b4c3b-8e6baf3f6a-tc3f1c";

router.get('/exchange-rate', async (req, res) => {
  try {
    const now = Date.now();
    // Cache the rate for 60 seconds (60000 ms) to avoid API limits
    if (!cachedRate || now - lastFetchTime > 60000) {
      const response = await fetch(FASTFOREX_API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch from fastforex API');
      }
      const data = await response.json();
      if (data && data.result && data.result.LKR) {
        cachedRate = data.result.LKR;
        lastFetchTime = now;
      }
    }
    res.json({ rate: cachedRate });
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    if (cachedRate) {
        res.json({ rate: cachedRate });
    } else {
        res.status(500).json({ error: "Failed to fetch exchange rate" });
    }
  }
});

router.get('/highlights', async (req, res) => {
  try {
    const snapshot = await realTimeStockService.getMarketSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
