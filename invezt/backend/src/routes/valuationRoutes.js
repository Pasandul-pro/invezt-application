import express from 'express';
import Valuation from '../models/Valuation.js';
import valuationService from '../services/valuationService.js';

const router = express.Router();

// All routes use authentication middleware from server.js

/**
 * POST /api/valuation/dcf
 * Calculate DCF valuation
 */
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
            userId: req.user?.id || 'demo-user',
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

/**
 * POST /api/valuation/capm
 * Calculate CAPM
 */
router.post('/capm', async (req, res) => {
    try {
        const { symbol, companyName, riskFreeRate, beta, marketRiskPremium } = req.body;
        
        const result = valuationService.calculateCAPM({
            riskFreeRate,
            beta,
            marketRiskPremium
        });
        
        const valuation = new Valuation({
            userId: req.user?.id || 'demo-user',
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

/**
 * POST /api/valuation/gordon
 * Calculate Gordon Growth Model
 */
router.post('/gordon', async (req, res) => {
    try {
        const { symbol, companyName, currentDividend, requiredReturn, dividendGrowthRate, currentPrice } = req.body;
        
        const result = valuationService.calculateGordon({
            currentDividend,
            requiredReturn,
            dividendGrowthRate,
            currentPrice
        });
        
        const valuation = new Valuation({
            userId: req.user?.id || 'demo-user',
            symbol,
            companyName,
            modelType: 'gordon',
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

/**
 * POST /api/valuation/comparable
 * Calculate Comparable Company Analysis
 */
router.post('/comparable', async (req, res) => {
    try {
        const { symbol, companyName, peerPE, peerPB, companyEPS, companyBVPS, currentPrice } = req.body;
        
        const result = valuationService.calculateComparable({
            peerPE,
            peerPB,
            companyEPS,
            companyBVPS,
            currentPrice
        });
        
        const valuation = new Valuation({
            userId: req.user?.id || 'demo-user',
            symbol,
            companyName,
            modelType: 'comparable',
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

/**
 * GET /api/valuation/history
 * Get user's valuation history
 */
router.get('/history', async (req, res) => {
    try {
        const valuations = await Valuation.find({ userId: req.user?.id || 'demo-user' })
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

/**
 * GET /api/valuation/:id
 * Get single valuation by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const valuation = await Valuation.findOne({
            _id: req.params.id,
            userId: req.user?.id || 'demo-user'
        });
        
        if (!valuation) {
            return res.status(404).json({ success: false, message: 'Valuation not found' });
        }
        
        res.status(200).json({ success: true, data: valuation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;