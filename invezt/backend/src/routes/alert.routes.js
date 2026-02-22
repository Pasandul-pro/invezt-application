import express from 'express';
import Alert from '../models/Alert.js';

const router = express.Router();

/**
 * @route GET /api/alerts
 * @desc Get all alerts (Sprint 0)
 */
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(10);
    res.json({ 
      success: true, 
      count: alerts.length,
      data: alerts,
      message: 'Alert schema is working! Sprint 0 complete.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/alerts/:id
 * @desc Get single alert by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;