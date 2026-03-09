// routes/portfolioRoutes.js
import express from 'express';
const router = express.Router();
import {
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
} from '../controllers/portfolioController.js';

// Middleware to protect routes (assuming you have authentication middleware)
import { protect } from '../middleware/auth.js';

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

export default router;
