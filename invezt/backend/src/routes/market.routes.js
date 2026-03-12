import express from 'express';
import realTimeStockService from '../services/realTimeStockService.js';

const router = express.Router();

router.get('/highlights', async (req, res) => {
  try {
    const snapshot = await realTimeStockService.getMarketSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
