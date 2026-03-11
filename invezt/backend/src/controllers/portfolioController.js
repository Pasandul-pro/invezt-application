import Portfolio from '../models/Portfolio.js';
import realTimeStockService from '../services/realTimeStockService.js';

/**
 * Fetch current stock prices from CSE live API for a list of tickers.
 */
const fetchCurrentPrices = async (tickers) => {
  const prices = {};
  if (!tickers || tickers.length === 0) return prices;
  try {
    for (const ticker of tickers) {
      const price = await realTimeStockService.getPriceForSymbol(ticker);
      prices[ticker] = price;
    }
  } catch (error) {
    console.error('Error fetching stock prices:', error.message);
  }
  return prices;
};

/**
 * GET /api/portfolio
 */
export const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const allTickers = new Set();
    portfolios.forEach(p => p.holdings.forEach(h => allTickers.add(h.companyTicker)));
    const currentPrices = await fetchCurrentPrices(Array.from(allTickers));

    const enrichedPortfolios = portfolios.map(portfolio => {
      const holdings = portfolio.holdings.map(h => {
        const currentPrice = currentPrices[h.companyTicker] ?? h.averageCost;
        const currentValue = h.shares * currentPrice;
        const totalCost = h.shares * h.averageCost;
        const gainLoss = currentValue - totalCost;
        const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
        return {
          ...h.toObject(),
          currentPrice,
          currentValue: parseFloat(currentValue.toFixed(2)),
          totalCost: parseFloat(totalCost.toFixed(2)),
          gainLoss: parseFloat(gainLoss.toFixed(2)),
          gainLossPercent: parseFloat(gainLossPercent.toFixed(2))
        };
      });

      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalInvestment = holdings.reduce((sum, h) => sum + h.totalCost, 0);

      return {
        ...portfolio.toObject(),
        holdings,
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        totalGainLoss: parseFloat((totalValue - totalInvestment).toFixed(2)),
        totalGainLossPercent: totalInvestment > 0
          ? parseFloat(((totalValue - totalInvestment) / totalInvestment * 100).toFixed(2))
          : 0
      };
    });

    res.status(200).json({ success: true, count: portfolios.length, data: enrichedPortfolios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching portfolios', error: error.message });
  }
};

/**
 * GET /api/portfolio/:id
 */
export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const tickers = portfolio.holdings.map(h => h.companyTicker);
    const currentPrices = await fetchCurrentPrices(tickers);

    const holdings = portfolio.holdings.map(h => {
      const currentPrice = currentPrices[h.companyTicker] ?? h.averageCost;
      const currentValue = h.shares * currentPrice;
      const totalCost = h.shares * h.averageCost;
      const gainLoss = currentValue - totalCost;
      const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
      return {
        ...h.toObject(),
        currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        gainLoss: parseFloat(gainLoss.toFixed(2)),
        gainLossPercent: parseFloat(gainLossPercent.toFixed(2))
      };
    });

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalInvestment = holdings.reduce((sum, h) => sum + h.totalCost, 0);

    res.status(200).json({
      success: true,
      data: {
        ...portfolio.toObject(),
        holdings,
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        totalGainLoss: parseFloat((totalValue - totalInvestment).toFixed(2)),
        totalGainLossPercent: totalInvestment > 0
          ? parseFloat(((totalValue - totalInvestment) / totalInvestment * 100).toFixed(2))
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching portfolio', error: error.message });
  }
};

/**
 * POST /api/portfolio
 */
export const createPortfolio = async (req, res) => {
  try {
    const { name, holdings } = req.body;
    const portfolio = new Portfolio({
      userId: req.user._id,
      name: name || 'My Portfolio',
      holdings: holdings || []
    });
    await portfolio.save();
    res.status(201).json({ success: true, message: 'Portfolio created', data: portfolio });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating portfolio', error: error.message });
  }
};

/**
 * PUT /api/portfolio/:id
 */
export const updatePortfolio = async (req, res) => {
  try {
    const { name } = req.body;
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    if (name) portfolio.name = name;
    portfolio.lastUpdated = Date.now();
    await portfolio.save();

    res.status(200).json({ success: true, message: 'Portfolio updated', data: portfolio });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating portfolio', error: error.message });
  }
};

/**
 * DELETE /api/portfolio/:id
 */
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    res.status(200).json({ success: true, message: 'Portfolio deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting portfolio', error: error.message });
  }
};

/**
 * POST /api/portfolio/:id/holdings
 */
export const addHolding = async (req, res) => {
  try {
    const { companyTicker, companyName, shares, averageCost, purchaseDate } = req.body;

    if (!companyTicker || !companyName || !shares || !averageCost) {
      return res.status(400).json({
        success: false,
        message: 'Required: companyTicker, companyName, shares, averageCost'
      });
    }

    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const ticker = companyTicker.toUpperCase().trim();
    const existingHolding = portfolio.holdings.find(h => h.companyTicker === ticker);

    if (existingHolding) {
      // Average down/up the cost
      const totalShares = existingHolding.shares + Number(shares);
      const totalCost = (existingHolding.shares * existingHolding.averageCost) + (Number(shares) * Number(averageCost));
      existingHolding.averageCost = parseFloat((totalCost / totalShares).toFixed(4));
      existingHolding.shares = totalShares;
    } else {
      portfolio.holdings.push({
        companyTicker: ticker,
        companyName,
        shares: Number(shares),
        averageCost: Number(averageCost),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : Date.now()
      });
    }

    portfolio.lastUpdated = Date.now();
    await portfolio.save();

    res.status(200).json({ success: true, message: 'Holding added', data: portfolio });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error adding holding', error: error.message });
  }
};

/**
 * PUT /api/portfolio/:id/holdings/:ticker
 */
export const updateHolding = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { shares, averageCost } = req.body;

    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const holding = portfolio.holdings.find(h => h.companyTicker === ticker.toUpperCase());
    if (!holding) return res.status(404).json({ success: false, message: 'Holding not found' });

    if (shares !== undefined) holding.shares = Number(shares);
    if (averageCost !== undefined) holding.averageCost = Number(averageCost);

    portfolio.lastUpdated = Date.now();
    await portfolio.save();

    res.status(200).json({ success: true, message: 'Holding updated', data: portfolio });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating holding', error: error.message });
  }
};

/**
 * DELETE /api/portfolio/:id/holdings/:ticker
 */
export const removeHolding = async (req, res) => {
  try {
    const { ticker } = req.params;

    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const initialCount = portfolio.holdings.length;
    portfolio.holdings = portfolio.holdings.filter(h => h.companyTicker !== ticker.toUpperCase());

    if (portfolio.holdings.length === initialCount) {
      return res.status(404).json({ success: false, message: 'Holding not found' });
    }

    portfolio.lastUpdated = Date.now();
    await portfolio.save();

    res.status(200).json({ success: true, message: 'Holding removed', data: portfolio });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error removing holding', error: error.message });
  }
};

/**
 * GET /api/portfolio/:id/performance
 */
export const getPerformance = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const tickers = portfolio.holdings.map(h => h.companyTicker);
    const currentPrices = await fetchCurrentPrices(tickers);

    const holdingsPerformance = portfolio.holdings.map(h => {
      const currentPrice = currentPrices[h.companyTicker] ?? h.averageCost;
      const currentValue = h.shares * currentPrice;
      const totalCost = h.shares * h.averageCost;
      const gainLoss = currentValue - totalCost;
      const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
      return {
        ticker: h.companyTicker,
        name: h.companyName,
        shares: h.shares,
        averageCost: h.averageCost,
        currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        gainLoss: parseFloat(gainLoss.toFixed(2)),
        gainLossPercent: parseFloat(gainLossPercent.toFixed(2))
      };
    }).sort((a, b) => b.gainLossPercent - a.gainLossPercent);

    const totalValue = holdingsPerformance.reduce((s, h) => s + h.currentValue, 0);
    const totalInvestment = holdingsPerformance.reduce((s, h) => s + h.shares * h.averageCost, 0);

    res.status(200).json({
      success: true,
      data: {
        portfolioName: portfolio.name,
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        totalGainLoss: parseFloat((totalValue - totalInvestment).toFixed(2)),
        totalGainLossPercent: totalInvestment > 0
          ? parseFloat(((totalValue - totalInvestment) / totalInvestment * 100).toFixed(2))
          : 0,
        bestPerforming: holdingsPerformance[0] || null,
        worstPerforming: holdingsPerformance[holdingsPerformance.length - 1] || null,
        holdings: holdingsPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching performance', error: error.message });
  }
};
