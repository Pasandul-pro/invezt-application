import express from 'express';
import calculationService from '../services/calculationService.js';
import CalculatedRatio from '../models/calculatedRatioModel.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/live/:symbol', async (req, res) => {
  try {
    const data = await calculationService.getRealTimeRatios(req.params.symbol.toUpperCase());
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/ratios/:symbol', async (req, res) => {
  try {
    const ratios = await CalculatedRatio.find({ symbol: req.params.symbol.toUpperCase() })
      .sort({ calculationTimestamp: -1 })
      .limit(10);
    res.json({ success: true, count: ratios.length, data: ratios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
