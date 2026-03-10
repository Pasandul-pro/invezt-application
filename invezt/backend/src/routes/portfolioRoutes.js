// routes/portfolioRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  addHolding,
  updateHolding,
  removeHolding,
  getTransactions,
  getPerformance,
  getPortfolioSummary
} = require('../controllers/portfolioController');

// Middleware to protect routes (assuming you have authentication middleware)
const { protect } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// Portfolio CRUD routes
router.route('/')
  .get(getAllPortfolios)
  .post(createPortfolio);

// Portfolio summary
router.get('/summary', getPortfolioSummary);

router.route('/:id')
  .get(getPortfolioById)
  .put(updatePortfolio)
  .delete(deletePortfolio);

// Holdings management
router.post('/:id/holdings', addHolding);
router.put('/:id/holdings/:ticker', updateHolding);
router.delete('/:id/holdings/:ticker', removeHolding);

// Transactions
router.get('/:id/transactions', getTransactions);

// Performance analytics
router.get('/:id/performance', getPerformance);

module.exports = router;
