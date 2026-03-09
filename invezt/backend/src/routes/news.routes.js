import express from 'express';
import News from '../models/News.js';

const router = express.Router();

/**
 * @route   GET /api/news
 * @desc    Get all news articles with pagination
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 */
router.get('/', async (req, res) => {
  // Get all news articles with pagination
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await News.find()
      .sort({ date: -1, isFeatured: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments();
    // Return all news articles with pagination

    res.json({
      success: true,
      count: news.length,
      data: news,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


/**
 * @route   GET /api/news/featured
 * @desc    Get featured news articles
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const news = await News.find({ isFeatured: true })
      .sort({ date: -1 })
      .limit(5);
      // Return featured news articles

    res.json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/news/category/:category
 * @desc    Get news by category with pagination
 * @access  Public
 * @param   category - News category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await News.find({ category })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

      
    const total = await News.countDocuments({ category });

    res.json({
      success: true,
      count: news.length,
      data: news,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/news/search
 * @desc    Search for news articles
 * @access  Public
 * @query   q - Search query
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ 
        success: true, 
        count: 0,
        data: [],
        message: 'Please provide at least 2 characters for search'
      });
    }

    const news = await News.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    })
    .sort({ date: -1 })
    .limit(20);

    res.json({
      success: true,
      count: news.length,
      data: news,
      query: q
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/news/latest
 * @desc    Get latest news (for sidebar/widget)
 * @access  Public
 */
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const news = await News.find()
      .sort({ date: -1 })
      .limit(limit)
      .select('title date category summary');

    res.json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/news/categories
 * @desc    Get all unique categories with counts
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      count: categories.length,
      data: categories.map(c => ({
        category: c._id,
        count: c.count
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/news/:id
 * @desc    Get single news article by ID (increments views)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ 
        success: false, 
        message: 'News article not found' 
      });
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/news/summarize
 * @desc    Generate AI summary for article content (Sprint 2)
 * @access  Public
 */
router.post('/summarize', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Summarize endpoint - will be fully implemented in Sprint 2',
    note: 'AI summary generation coming soon!'
  });
});

export default router;