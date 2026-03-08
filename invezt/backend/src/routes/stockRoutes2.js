const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const FinancialRatio = require('../models/FinancialRatio');
const AnalysisResult = require('../models/AnalysisResult');
const authMiddleware = require('../middleware/authMiddleware');
console.log('authMiddleware:', authMiddleware);

// GET all stocks (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stocks/:symbol/analysis (protected)
router.get('/:symbol/analysis', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;

    // Step 1: Find the stock by symbol
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: `Stock "${symbol}" not found.` });
    }

    // Step 2: Get the latest financial ratios for this stock
    const ratios = await FinancialRatio.findOne({ stockId: stock._id })
      .sort({ date: -1 });

    if (!ratios) {
      return res.status(404).json({ message: `No financial data found for "${symbol}".` });
    }

    // Step 3: Calculate star rating based on ratios
    const starRating = calculateStarRating(ratios);

    // Step 4: Determine recommendation
    const recommendation = starRating >= 4 ? 'Buy' : starRating === 3 ? 'Hold' : 'Sell';

    // Step 5: Save the analysis result to DB
    const analysis = new AnalysisResult({
      stockId: stock._id,
      valuationModel: 'CAPM',
      intrinsicValue: ratios.peRatio * 10,
      recommendation,
      starRating,
    });
    await analysis.save();

    // Step 6: Return the full response
    res.json({
      stock: {
        symbol: stock.symbol,
        companyName: stock.companyName,
        sector: stock.sector,
        marketCap: stock.marketCap,
      },
      ratios: {
        peRatio: ratios.peRatio,
        roe: ratios.roe,
        debtToEquity: ratios.debtToEquity,
        eps: ratios.eps,
        pbRatio: ratios.pbRatio,
        currentRatio: ratios.currentRatio,
      },
      analysis: {
        starRating,
        recommendation,
        valuationModel: 'CAPM',
        analysisDate: analysis.analysisDate,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Star Rating Calculator ---
function calculateStarRating(ratios) {
  let score = 0;

  // P/E Ratio: lower is better (under 15 is great)
  if (ratios.peRatio < 15) score += 2;
  else if (ratios.peRatio < 25) score += 1;

  // ROE: higher is better (above 15% is good)
  if (ratios.roe > 15) score += 2;
  else if (ratios.roe > 10) score += 1;

  // Debt to Equity: lower is better (under 1 is safe)
  if (ratios.debtToEquity < 1) score += 2;
  else if (ratios.debtToEquity < 2) score += 1;

  // Current Ratio: above 1.5 is healthy
  if (ratios.currentRatio > 1.5) score += 2;
  else if (ratios.currentRatio > 1) score += 1;

  // Convert score (0-8) to star rating (1-5)
  if (score >= 7) return 5;
  if (score >= 5) return 4;
  if (score >= 3) return 3;
  if (score >= 1) return 2;
  return 1;
}

module.exports = router;