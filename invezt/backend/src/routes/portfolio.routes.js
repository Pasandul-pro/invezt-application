import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  addHolding,
  updateHolding,
  removeHolding,
  getPerformance
} from '../controllers/portfolioController.js';

const router = express.Router();

// All portfolio routes require authentication
router.use(protect);

router.route('/')
  .get(getAllPortfolios)
  .post(createPortfolio);

router.route('/:id')
  .get(getPortfolioById)
  .put(updatePortfolio)
  .delete(deletePortfolio);

router.post('/:id/holdings', addHolding);
router.put('/:id/holdings/:ticker', updateHolding);
router.delete('/:id/holdings/:ticker', removeHolding);
router.get('/:id/performance', getPerformance);

export default router;
