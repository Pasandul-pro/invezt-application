const express = require('express');
const router = express.Router();
const {
    getPortfolios,
    getPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    getPortfolioSummary,
    refreshPrices
} = require('../controllers/portfolioController');

const { protect } = require('../../middleware/authMiddleware'); // Adjust path as needed

// All routes require authentication
router.use(protect);

// Summary route (must come before /:id)
router.get('/summary', getPortfolioSummary);
router.post('/refresh', refreshPrices);

// CRUD routes
router.route('/')
    .get(getPortfolios)
    .post(createPortfolio);

router.route('/:id')
    .get(getPortfolio)
    .put(updatePortfolio)
    .delete(deletePortfolio);

module.exports = router;