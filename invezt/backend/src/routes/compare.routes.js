import express from 'express';
import { compareCompanies } from '../controllers/compareController.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/compare/companies?symbols=JKH.N0000,COMB.N0000&year=2024&periodType=ANNUAL
 * Compare 1–3 CSE-listed companies side-by-side with financial ratios and live prices
 */
router.get('/companies', protect, compareCompanies);

export default router;
