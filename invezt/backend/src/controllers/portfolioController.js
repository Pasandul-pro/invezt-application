import Portfolio from "../models/Portfolio.js";
import StockPrice from "../models/stockPriceModel.js";
import realTimeStockService from "../services/realTimeStockService.js";

const QUOTE_REFRESH_MS = 10 * 60 * 1000;
const HISTORY_LIMIT = 5000;
const normalizeSymbol = (symbol) =>
  realTimeStockService.normalizeSymbol(symbol);

/**
 * Fetch current stock prices from the shared 10-minute CSE quote snapshot.
 */
const fetchCurrentQuotes = async (tickers) => {
  if (!tickers || tickers.length === 0) {
    return {
      quoteMap: new Map(),
      fetchedAt: null,
      source: "empty",
      stale: false,
    };
  }

  try {
    return await realTimeStockService.getQuotesForSymbols(tickers, {
      maxAgeMs: QUOTE_REFRESH_MS,
      allowStaleCache: true,
      allowStoredFallback: true,
      allowSimulatedFallback: false,
    });
  } catch (error) {
    console.error("Error fetching stock prices:", error.message);
    return {
      quoteMap: new Map(),
      fetchedAt: null,
      source: "unavailable",
      stale: true,
    };
  }
};

const enrichPortfolio = (portfolio, quoteSnapshot) => {
  const quoteMap = quoteSnapshot.quoteMap || new Map();

  const holdings = portfolio.holdings.map((h) => {
    const symbol = normalizeSymbol(h.companyTicker);
    const quote = quoteMap.get(symbol) || null;
    const currentPrice = quote?.lastTradedPrice ?? h.averageCost;
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
      gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
      priceSource: quote?.source || "cost-basis",
      priceAsOf: quote?.priceAsOf || null,
      priceStale: quote?.stale || false,
      hasOfficialPrice: Boolean(quote),
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
    totalGainLossPercent:
      totalInvestment > 0
        ? parseFloat(
            (((totalValue - totalInvestment) / totalInvestment) * 100).toFixed(
              2,
            ),
          )
        : 0,
    pricesUpdatedAt: quoteSnapshot.fetchedAt,
    priceSource: quoteSnapshot.source,
    priceStale: quoteSnapshot.stale,
    refreshIntervalMinutes: QUOTE_REFRESH_MS / 60000,
  };
};

const normalizeHistoryEntry = (entry) => ({
  recordedAt: entry.recordedAt,
  totalValue: parseFloat(Number(entry.totalValue || 0).toFixed(2)),
  totalInvestment: parseFloat(Number(entry.totalInvestment || 0).toFixed(2)),
  totalGainLoss: parseFloat(Number(entry.totalGainLoss || 0).toFixed(2)),
  totalGainLossPercent: parseFloat(
    Number(entry.totalGainLossPercent || 0).toFixed(2),
  ),
  priceSource: entry.priceSource || "cse",
  priceStale: Boolean(entry.priceStale),
});

const buildHistoryEntry = (
  recordedAt,
  totalValue,
  totalInvestment,
  priceSource,
  priceStale,
) => {
  const gainLoss = totalValue - totalInvestment;
  const gainLossPercent =
    totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;

  return normalizeHistoryEntry({
    recordedAt,
    totalValue,
    totalInvestment,
    totalGainLoss: gainLoss,
    totalGainLossPercent: gainLossPercent,
    priceSource,
    priceStale,
  });
};

const mergeHistoryEntries = (entries) => {
  const sorted = [...entries]
    .filter((entry) => entry?.recordedAt)
    .map((entry) => normalizeHistoryEntry(entry))
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );

  const merged = [];
  for (const entry of sorted) {
    const lastEntry = merged[merged.length - 1] || null;
    const entryTime = new Date(entry.recordedAt).getTime();
    const lastTime = lastEntry ? new Date(lastEntry.recordedAt).getTime() : -1;

    if (lastEntry && entryTime === lastTime) {
      merged[merged.length - 1] = entry;
    } else {
      merged.push(entry);
    }
  }

  if (merged.length <= HISTORY_LIMIT) {
    return merged;
  }

  return merged.slice(merged.length - HISTORY_LIMIT);
};

const backfillPortfolioHistory = async (portfolio, existingHistory) => {
  if (portfolio.historyBackfilledAt) {
    return existingHistory;
  }

  const holdings = (portfolio.holdings || [])
    .map((holding) => ({
      symbol: normalizeSymbol(holding.companyTicker),
      shares: Number(holding.shares || 0),
      averageCost: Number(holding.averageCost || 0),
      purchaseDate: holding.purchaseDate
        ? new Date(holding.purchaseDate)
        : null,
    }))
    .filter((holding) => holding.symbol && holding.shares > 0);

  if (holdings.length === 0) {
    portfolio.historyBackfilledAt = new Date();
    await portfolio.save();
    return existingHistory;
  }

  const earliestPurchaseDate = holdings.reduce((earliest, holding) => {
    const purchaseTime =
      holding.purchaseDate && !Number.isNaN(holding.purchaseDate.getTime())
        ? holding.purchaseDate.getTime()
        : Date.now();
    return Math.min(earliest, purchaseTime);
  }, Date.now());

  const firstTrackedAt = existingHistory[0]?.recordedAt
    ? new Date(existingHistory[0].recordedAt)
    : null;

  const matchStage = {
    symbol: { $in: holdings.map((holding) => holding.symbol) },
    timestamp: { $gte: new Date(earliestPurchaseDate) },
  };

  if (firstTrackedAt && !Number.isNaN(firstTrackedAt.getTime())) {
    matchStage.timestamp.$lt = firstTrackedAt;
  }

  const historicalRows = await StockPrice.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        bucketTimestamp: {
          $toDate: {
            $subtract: [
              { $toLong: "$timestamp" },
              { $mod: [{ $toLong: "$timestamp" }, QUOTE_REFRESH_MS] },
            ],
          },
        },
      },
    },
    { $sort: { symbol: 1, bucketTimestamp: 1, timestamp: 1 } },
    {
      $group: {
        _id: { symbol: "$symbol", bucketTimestamp: "$bucketTimestamp" },
        symbol: { $last: "$symbol" },
        bucketTimestamp: { $last: "$bucketTimestamp" },
        price: { $last: "$price" },
      },
    },
    { $sort: { bucketTimestamp: 1, symbol: 1 } },
  ]);

  if (historicalRows.length === 0) {
    portfolio.historyBackfilledAt = new Date();
    await portfolio.save();
    return existingHistory;
  }

  const rowsByBucket = new Map();
  for (const row of historicalRows) {
    const bucketKey = new Date(row.bucketTimestamp).toISOString();
    const currentRows = rowsByBucket.get(bucketKey) || [];
    currentRows.push(row);
    rowsByBucket.set(bucketKey, currentRows);
  }

  const latestPriceBySymbol = new Map();
  const backfilledEntries = [];
  const sortedBucketKeys = [...rowsByBucket.keys()].sort();

  for (const bucketKey of sortedBucketKeys) {
    const bucketTime = new Date(bucketKey);
    const bucketRows = rowsByBucket.get(bucketKey) || [];

    for (const row of bucketRows) {
      latestPriceBySymbol.set(row.symbol, Number(row.price));
    }

    const activeHoldings = holdings.filter((holding) => {
      if (
        !holding.purchaseDate ||
        Number.isNaN(holding.purchaseDate.getTime())
      ) {
        return true;
      }
      return holding.purchaseDate.getTime() <= bucketTime.getTime();
    });

    if (activeHoldings.length === 0) {
      continue;
    }

    const totalValue = activeHoldings.reduce((sum, holding) => {
      const price =
        latestPriceBySymbol.get(holding.symbol) ?? holding.averageCost;
      return sum + holding.shares * price;
    }, 0);

    const totalInvestment = activeHoldings.reduce(
      (sum, holding) => sum + holding.shares * holding.averageCost,
      0,
    );

    backfilledEntries.push(
      buildHistoryEntry(
        bucketTime,
        totalValue,
        totalInvestment,
        "stockprice-backfill",
        false,
      ),
    );
  }

  const nextHistory = mergeHistoryEntries([
    ...backfilledEntries,
    ...existingHistory,
  ]);
  portfolio.valueHistory = nextHistory;
  portfolio.historyBackfilledAt = new Date();
  await portfolio.save();

  return nextHistory;
};

const shouldTrackHistory = (summary) => {
  return Boolean(
    summary.pricesUpdatedAt &&
    summary.priceSource !== "empty" &&
    summary.priceSource !== "unavailable",
  );
};

const syncPortfolioHistory = async (portfolio, summary) => {
  let existingHistory = Array.isArray(portfolio.valueHistory)
    ? portfolio.valueHistory.map((entry) => normalizeHistoryEntry(entry))
    : [];

  existingHistory = await backfillPortfolioHistory(portfolio, existingHistory);

  if (!shouldTrackHistory(summary)) {
    return {
      ...summary,
      valueHistory: existingHistory,
      trackedSince: existingHistory[0]?.recordedAt || null,
    };
  }

  const recordedAt = new Date(summary.pricesUpdatedAt);
  if (Number.isNaN(recordedAt.getTime())) {
    return {
      ...summary,
      valueHistory: existingHistory,
      trackedSince: existingHistory[0]?.recordedAt || null,
    };
  }

  const nextEntry = {
    recordedAt,
    totalValue: summary.totalValue,
    totalInvestment: summary.totalInvestment,
    totalGainLoss: summary.totalGainLoss,
    totalGainLossPercent: summary.totalGainLossPercent,
    priceSource: summary.priceSource,
    priceStale: summary.priceStale,
  };

  const lastEntry = existingHistory[existingHistory.length - 1] || null;
  const sameTimestamp = lastEntry
    ? new Date(lastEntry.recordedAt).getTime() === recordedAt.getTime()
    : false;

  let didChange = false;
  let nextHistory = [...existingHistory];

  if (!lastEntry) {
    nextHistory.push(nextEntry);
    didChange = true;
  } else if (sameTimestamp) {
    const lastIndex = nextHistory.length - 1;
    const hasValueChanged =
      lastEntry.totalValue !== nextEntry.totalValue ||
      lastEntry.totalInvestment !== nextEntry.totalInvestment ||
      lastEntry.totalGainLoss !== nextEntry.totalGainLoss ||
      lastEntry.totalGainLossPercent !== nextEntry.totalGainLossPercent ||
      lastEntry.priceSource !== nextEntry.priceSource ||
      lastEntry.priceStale !== nextEntry.priceStale;

    if (hasValueChanged) {
      nextHistory[lastIndex] = nextEntry;
      didChange = true;
    }
  } else {
    nextHistory.push(nextEntry);
    didChange = true;
  }

  nextHistory = mergeHistoryEntries(nextHistory);

  if (didChange) {
    portfolio.valueHistory = nextHistory;
    await portfolio.save();
  }

  return {
    ...summary,
    valueHistory: nextHistory,
    trackedSince: nextHistory[0]?.recordedAt || null,
  };
};

export const __testables = {
  normalizeHistoryEntry,
  buildHistoryEntry,
  mergeHistoryEntries,
  shouldTrackHistory,
};

/**
 * GET /api/portfolio
 */
export const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const allTickers = new Set();
    portfolios.forEach((p) =>
      p.holdings.forEach((h) => allTickers.add(h.companyTicker)),
    );
    const quoteSnapshot = await fetchCurrentQuotes(Array.from(allTickers));
    const enrichedPortfolios = await Promise.all(
      portfolios.map((portfolio) =>
        syncPortfolioHistory(
          portfolio,
          enrichPortfolio(portfolio, quoteSnapshot),
        ),
      ),
    );

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: enrichedPortfolios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching portfolios",
      error: error.message,
    });
  }
};

/**
 * GET /api/portfolio/:id
 */
export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!portfolio)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });

    const tickers = portfolio.holdings.map((h) => h.companyTicker);
    const quoteSnapshot = await fetchCurrentQuotes(tickers);
    const enrichedPortfolio = await syncPortfolioHistory(
      portfolio,
      enrichPortfolio(portfolio, quoteSnapshot),
    );

    res.status(200).json({
      success: true,
      data: enrichedPortfolio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching portfolio",
      error: error.message,
    });
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
      name: name || "My Portfolio",
      holdings: holdings || [],
    });
    await portfolio.save();
    res
      .status(201)
      .json({ success: true, message: "Portfolio created", data: portfolio });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating portfolio",
      error: error.message,
    });
  }
};

/**
 * PUT /api/portfolio/:id
 */
export const updatePortfolio = async (req, res) => {
  try {
    const { name } = req.body;
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!portfolio)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });

    if (name) portfolio.name = name;
    portfolio.lastUpdated = Date.now();
    await portfolio.save();

    res
      .status(200)
      .json({ success: true, message: "Portfolio updated", data: portfolio });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating portfolio",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/portfolio/:id
 */
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!portfolio)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });
    res.status(200).json({ success: true, message: "Portfolio deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting portfolio",
      error: error.message,
    });
  }
};

/**
 * POST /api/portfolio/:id/holdings
 */
export const addHolding = async (req, res) => {
  try {
    const { companyTicker, companyName, shares, averageCost, purchaseDate } =
      req.body;

    if (!companyTicker || !companyName || !shares || !averageCost) {
      return res.status(400).json({
        success: false,
        message: "Required: companyTicker, companyName, shares, averageCost",
      });
    }

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!portfolio)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });

    const ticker = normalizeSymbol(companyTicker);
    const existingHolding = portfolio.holdings.find(
      (h) => normalizeSymbol(h.companyTicker) === ticker,
    );

    if (existingHolding) {
      // Average down/up the cost
      const totalShares = existingHolding.shares + Number(shares);
      const totalCost =
        existingHolding.shares * existingHolding.averageCost +
        Number(shares) * Number(averageCost);
      existingHolding.averageCost = parseFloat(
        (totalCost / totalShares).toFixed(4),
      );
      existingHolding.shares = totalShares;
    } else {
      portfolio.holdings.push({
        companyTicker: ticker,
        companyName,
        shares: Number(shares),
        averageCost: Number(averageCost),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : Date.now(),
      });
    }

    portfolio.lastUpdated = Date.now();
    await portfolio.save();

    res
      .status(200)
      .json({ success: true, message: "Holding added", data: portfolio });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding holding",
      error: error.message,
    });
  }
};

/**
 * PUT /api/portfolio/:id/holdings/:ticker
 */
export const updateHolding = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { shares, averageCost } = req.body;

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!portfolio)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });

    const normalizedTicker = normalizeSymbol(ticker);
    const holding = portfolio.holdings.find(
      (h) => normalizeSymbol(h.companyTicker) === normalizedTicker,
    );
    if (!holding)
      return res
        .status(404)
        .json({ success: false, message: "Holding not found" });

    if (shares !== undefined) holding.shares = Number(shares);
    if (averageCost !== undefined) holding.averageCost = Number(averageCost);

    portfolio.lastUpdated = Date.now();
    await portfolio.save();

    res
      .status(200)
      .json({ success: true, message: "Holding updated", data: portfolio });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating holding",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/portfolio/:id/holdings/:ticker
 */
export const removeHolding = async (req, res) => {
  try {
    const { ticker } = req.params;

    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!portfolio)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });

    const initialCount = portfolio.holdings.length;
    const normalizedTicker = normalizeSymbol(ticker);
    portfolio.holdings = portfolio.holdings.filter(
      (h) => normalizeSymbol(h.companyTicker) !== normalizedTicker,
    );

    if (portfolio.holdings.length === initialCount) {
      return res
        .status(404)
        .json({ success: false, message: "Holding not found" });
    }

    portfolio.lastUpdated = Date.now();
    await portfolio.save();

    res
      .status(200)
      .json({ success: true, message: "Holding removed", data: portfolio });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error removing holding",
      error: error.message,
    });
  }
};

/**
 * GET /api/portfolio/:id/performance
 */
export const getPerformance = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!portfolio)
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });

    const tickers = portfolio.holdings.map((h) => h.companyTicker);
    const quoteSnapshot = await fetchCurrentQuotes(tickers);
    const quoteMap = quoteSnapshot.quoteMap || new Map();

    const holdingsPerformance = portfolio.holdings
      .map((h) => {
        const quote = quoteMap.get(normalizeSymbol(h.companyTicker)) || null;
        const currentPrice = quote?.lastTradedPrice ?? h.averageCost;
        const currentValue = h.shares * currentPrice;
        const totalCost = h.shares * h.averageCost;
        const gainLoss = currentValue - totalCost;
        const gainLossPercent =
          totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
        return {
          ticker: h.companyTicker,
          name: h.companyName,
          shares: h.shares,
          averageCost: h.averageCost,
          currentPrice,
          currentValue: parseFloat(currentValue.toFixed(2)),
          gainLoss: parseFloat(gainLoss.toFixed(2)),
          gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
          priceSource: quote?.source || "cost-basis",
          priceAsOf: quote?.priceAsOf || null,
          priceStale: quote?.stale || false,
        };
      })
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent);

    const totalValue = holdingsPerformance.reduce(
      (s, h) => s + h.currentValue,
      0,
    );
    const totalInvestment = holdingsPerformance.reduce(
      (s, h) => s + h.shares * h.averageCost,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        portfolioName: portfolio.name,
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        totalGainLoss: parseFloat((totalValue - totalInvestment).toFixed(2)),
        totalGainLossPercent:
          totalInvestment > 0
            ? parseFloat(
                (
                  ((totalValue - totalInvestment) / totalInvestment) *
                  100
                ).toFixed(2),
              )
            : 0,
        pricesUpdatedAt: quoteSnapshot.fetchedAt,
        priceSource: quoteSnapshot.source,
        priceStale: quoteSnapshot.stale,
        valueHistory: Array.isArray(portfolio.valueHistory)
          ? portfolio.valueHistory.map((entry) => normalizeHistoryEntry(entry))
          : [],
        bestPerforming: holdingsPerformance[0] || null,
        worstPerforming:
          holdingsPerformance[holdingsPerformance.length - 1] || null,
        holdings: holdingsPerformance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching performance",
      error: error.message,
    });
  }
};
