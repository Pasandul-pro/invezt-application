import express from 'express';
import News from '../models/News.js';

const router = express.Router();

/**
 * @route GET /api/news
 * @desc Get all news articles (Sprint 0)
 */
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 }).limit(10);
    res.json({ 
      success: true, 
      count: news.length,
      data: news,
      message: 'News schema is working! Sprint 0 complete.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/news/:id
 * @desc Get single news article by ID (Sprint 0)
 */
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/news/category/:category
 * @desc Get news by category (Sprint 0)
 */
router.get('/category/:category', async (req, res) => {
  try {
    const news = await News.find({ category: req.params.category }).sort({ date: -1 });
    res.json({ success: true, count: news.length, data: news });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/news/search
 * @desc Search for news articles (already existed)
 */
router.get('/search', (req, res) => {
  // This will be implemented in Sprint 1
  res.json({ message: 'Search endpoint - to be implemented in Sprint 1' });
});

/**
 * @route POST /api/news/summarize
 * @desc Generate AI summary for article content (already existed)
 */
router.post('/summarize', (req, res) => {
  // This will be implemented in Sprint 1
  res.json({ message: 'Summarize endpoint - to be implemented in Sprint 1' });
});

export default router;