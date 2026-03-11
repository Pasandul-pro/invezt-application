import express from 'express';
import Valuation from '../models/Valuation.js';
import valuationService from '../services/valuationService.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/dcf', async (req, res) => {
    try {
        const { symbol, companyName, cashFlows, discountRate, perpetualGrowthRate, sharesOutstanding, currentPrice } = req.body;
        
        const result = valuationService.calculateDCF({
            cashFlows,
            discountRate,
            perpetualGrowthRate,
            sharesOutstanding
        });
        
        if (currentPrice) {
            result.marginOfSafety = Number(((result.intrinsicValue - currentPrice) / result.intrinsicValue * 100).toFixed(2));
        }
        
        const valuation = new Valuation({
            userId: req.user._id,
            symbol,
            companyName,
            modelType: 'dcf',
            inputData: req.body,
            results: result
        });
        
        await valuation.save();
        
        res.status(200).json({
            success: true,
            data: result,
            savedId: valuation._id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/capm', async (req, res) => {
    try {
        const { symbol, companyName, riskFreeRate, beta, marketRiskPremium } = req.body;
        
        const result = valuationService.calculateCAPM({
            riskFreeRate,
            beta,
            marketRiskPremium
        });
        
        const valuation = new Valuation({
            userId: req.user._id,
            symbol,
            companyName,
            modelType: 'capm',
            inputData: req.body,
            results: result
        });
        
        await valuation.save();
        
        res.status(200).json({
            success: true,
            data: result,
            savedId: valuation._id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/history', async (req, res) => {
    try {
        const valuations = await Valuation.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.status(200).json({
            success: true,
            count: valuations.length,
            data: valuations
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
