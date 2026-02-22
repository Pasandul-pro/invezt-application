import express from 'express';
import NotificationSettings from '../models/NotificationSettings.js';

const router = express.Router();

/**
 * @route GET /api/notification-settings
 * @desc Get notification settings (Sprint 0)
 */
router.get('/', async (req, res) => {
  try {
    const settings = await NotificationSettings.find().limit(10);
    res.json({ 
      success: true, 
      count: settings.length,
      data: settings,
      message: 'NotificationSettings schema is working! Sprint 0 complete.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/notification-settings/:userId
 * @desc Get settings for specific user
 */
router.get('/:userId', async (req, res) => {
  try {
    const settings = await NotificationSettings.findOne({ userId: req.params.userId });
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;