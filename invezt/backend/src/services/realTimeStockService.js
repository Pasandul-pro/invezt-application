import axios from "axios";
import StockPrice from "../models/stockPriceModel.js";

// ── Realistic CSE Price Simulation (Geometric Brownian Motion) ────────────────
//
// Uses GBM — the standard financial model for short-term price movement.
// Each stock has its own annual volatility. Prices update every 15 seconds,
// carry momentum between ticks (trending behaviour), and gently mean-revert
// to today's open price so intraday drift stays within ±2% — just like
// real CSE intraday trading looks to a user.
//
// If the real CSE API fails, these functions are called transparently
// and the frontend never sees an error.

// ── Stock config: [open price (LKR), annual volatility σ, display name] ───────
const STOCK_CONFIG = {
  "JKH.N0000": { base: 190.0, vol: 0.22, name: "John Keells Holdings" },
  "COMB.N0000": { base: 44.5, vol: 0.15, name: "Commercial Bank" },
  "HNB.N0000": { base: 168.0, vol: 0.16, name: "Hatton National Bank" },
  "SAMP.N0000": { base: 78.0, vol: 0.17, name: "Sampath Bank" },
  "NTB.N0000": { base: 67.5, vol: 0.18, name: "Nations Trust Bank" },
  "LOLC.N0000": { base: 360.0, vol: 0.28, name: "LOLC Holdings" },
  "CFVF.N0000": { base: 12.5, vol: 0.38, name: "Central Finance" },
  "CIC.N0000": { base: 50.0, vol: 0.25, name: "CIC Holdings" },
  "DIAL.N0000": { base: 11.5, vol: 0.3, name: "Dialog Axiata" },
  "HAYL.N0000": { base: 95.0, vol: 0.2, name: "Hayleys PLC" },
  "LION.N0000": { base: 450.0, vol: 0.18, name: "Lion Brewery" },
  "RICH.N0000": { base: 36.0, vol: 0.35, name: "Richard Pieris" },
  "CCS.N0000": { base: 18.0, vol: 0.4, name: "CCS PLC" },
  "DIPD.N0000": { base: 22.5, vol: 0.32, name: "Dipped Products" },
  "KZOO.N0000": { base: 580.0, vol: 0.2, name: "Keells Food Products" },
  "BUKI.N0000": { base: 5.8, vol: 0.45, name: "Buki PLC" },
  "EAST.N0000": { base: 25.0, vol: 0.36, name: "Eastman Exports" },
  "PARQ.N0000": { base: 14.0, vol: 0.38, name: "Parquet Ceylon" },
  "REXP.N0000": { base: 8.5, vol: 0.42, name: "Richard Exports" },
  "GREG.N0000": { base: 20.0, vol: 0.35, name: "Greener Pastures" },
};

// ── GBM parameters ────────────────────────────────────────────────────────────
const TICK_SECONDS = 15; // price update every 15 seconds
const TRADING_SECS = 6.5 * 3600; // CSE trades 6.5 hours/day
const TRADING_DAYS = 240; // ~240 CSE trading days/year
const TICKS_PER_YEAR = (TRADING_SECS / TICK_SECONDS) * TRADING_DAYS;
const DT = 1 / TICKS_PER_YEAR; // fraction of a trading year per tick
const ANNUAL_DRIFT = 0.07; // 7% annual average return (CSE long-run)

// ── Box-Muller: produces a standard normal random variable ───────────────────
function randn() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ── Initialise state for each stock ─────────────────────────────────────────
const fakePrices = {};
for (const [sym, cfg] of Object.entries(STOCK_CONFIG)) {
  // Small random open gap vs yesterday's close (±0.8%) — simulates overnight moves
  const openGap = 1 + (Math.random() - 0.5) * 0.016;
  const open = parseFloat((cfg.base * openGap).toFixed(2));
  fakePrices[sym] = {
    price: open,
    openPrice: open, // today's reference — mean reversion target
    prevTickPrice: open,
    momentum: 0, // GBM drift carry: 30% bleeds into next tick
    totalVolume: Math.floor(Math.random() * 200_000) + 50_000,
  };
}

// ── ASPI / S&P SL20 state (correlated with overall market noise) ─────────────
let aspiValue = 11_823.45,
  aspiMomentum = 0;
let snpValue = 4_108.2,
  snpMomentum = 0;
const warnedFallbacks = new Set();
const QUOTE_CACHE_TTL_MS = 10 * 60 * 1000;
const SYMBOL_ALIASES = {
  CMB: "COMB",
  "CMB.N0000": "COMB.N0000",
};

function warnOnce(key, message) {
  if (warnedFallbacks.has(key)) return;
  warnedFallbacks.add(key);
  console.warn(message);
}

function normalizeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function buildQuoteFromTradeRow(row) {
  const symbol = String(row?.symbol || row?.securityCode || "")
    .toUpperCase()
    .trim();
  const lastTradedPrice = normalizeNumber(
    row?.lastTradedPrice ?? row?.lastPrice ?? row?.price,
  );

  if (!symbol || lastTradedPrice == null) {
    return null;
  }

  return {
    symbol,
    lastTradedPrice,
    change: normalizeNumber(row?.change),
    changePercentage: normalizeNumber(row?.changePercentage),
    volume: normalizeNumber(row?.volume),
    marketCap: normalizeNumber(row?.marketCap),
  };
}

// ── GBM tick function (runs every TICK_SECONDS) ───────────────────────────────
// Formula: P(t+dt) = P(t) * exp( (μ - σ²/2)dt + σ√dt * Z )
// + momentum carry (30% of last tick direction persists)
// + mean reversion (gentle pull back to open if price drifts >2%)
function tickFakePrices() {
  for (const [sym, state] of Object.entries(fakePrices)) {
    const σ = STOCK_CONFIG[sym].vol;

    // GBM return for this tick
    const Z = randn();
    const gbmReturn = (ANNUAL_DRIFT - 0.5 * σ * σ) * DT + σ * Math.sqrt(DT) * Z;

    // Momentum: 30% of previous move direction persists (trending)
    state.momentum = 0.3 * state.momentum + 0.7 * gbmReturn;

    // Mean reversion: if we've drifted >2% from today's open, nudge back
    const drift = (state.price - state.openPrice) / state.openPrice;
    const reversion = -0.05 * drift;

    const totalReturn = state.momentum + reversion;

    // Apply to price (floor at 0.10 so it never goes negative)
    const newPrice = parseFloat(
      Math.max(state.price * Math.exp(totalReturn), 0.1).toFixed(2),
    );

    // Volume spikes on bigger price moves (realistic microstructure)
    const absMoveRatio = Math.abs(newPrice - state.price) / state.price;
    const volSpike = 1 + absMoveRatio * 50;
    const tickVol = Math.floor((Math.random() * 5_000 + 500) * volSpike);

    state.prevTickPrice = state.price;
    state.price = newPrice;
    state.totalVolume += tickVol;
  }

  // Tick market indices (slightly correlated market noise)
  const marketZ = randn() * 0.0015;
  aspiMomentum = 0.4 * aspiMomentum + 0.6 * marketZ;
  aspiValue = parseFloat(
    Math.max(aspiValue * Math.exp(aspiMomentum), 1000).toFixed(2),
  );

  const snpZ = randn() * 0.0018;
  snpMomentum = 0.4 * snpMomentum + 0.6 * snpZ;
  snpValue = parseFloat(
    Math.max(snpValue * Math.exp(snpMomentum), 500).toFixed(2),
  );
}

// Start the 15-second tick — 4 updates per minute.
// unref keeps test and script imports from hanging the Node process.
const fakePriceTicker = setInterval(tickFakePrices, TICK_SECONDS * 1000);
fakePriceTicker.unref?.();
console.log(
  "📊 [Fallback] GBM price simulator started — 15s ticks, 20 CSE stocks",
);

// ── Helper: single stock info ─────────────────────────────────────────────────
function getFakeStockInfo(symbol) {
  const sym = String(symbol).toUpperCase().trim();
  const state = fakePrices[sym];
  const cfg = STOCK_CONFIG[sym];

  if (!state) {
    // Symbol not in our list — generate on-the-fly with medium vol
    const base = 50 + Math.random() * 150;
    const price = parseFloat((base * Math.exp(randn() * 0.002)).toFixed(2));
    return {
      symbol: sym,
      name: sym,
      lastTradedPrice: price,
      change: 0,
      changePercentage: 0,
      marketCap: null,
      beta: null,
      logo: null,
      isFallback: true,
    };
  }

  const change = parseFloat((state.price - state.openPrice).toFixed(2));
  const changePct = parseFloat(((change / state.openPrice) * 100).toFixed(2));

  return {
    symbol: sym,
    name: cfg.name,
    lastTradedPrice: state.price,
    change,
    changePercentage: changePct,
    volume: state.totalVolume,
    marketCap: null,
    beta: null,
    logo: null,
    isFallback: true,
  };
}

// ── Helper: full market snapshot ──────────────────────────────────────────────
function getFakeMarketSnapshot() {
  const list = Object.entries(fakePrices).map(([sym, state]) => {
    const change = parseFloat((state.price - state.openPrice).toFixed(2));
    const changePct = parseFloat(((change / state.openPrice) * 100).toFixed(2));
    return {
      symbol: sym,
      name: STOCK_CONFIG[sym]?.name || sym,
      lastTradedPrice: state.price,
      change,
      changePercentage: changePct,
      volume: state.totalVolume,
    };
  });

  const sorted = [...list].sort(
    (a, b) => b.changePercentage - a.changePercentage,
  );

  return {
    success: true,
    isFallback: true,
    timestamp: new Date(),
    indices: {
      aspi: { value: aspiValue, isPositive: aspiMomentum >= 0 },
      snp: { value: snpValue, isPositive: snpMomentum >= 0 },
    },
    marketSummary: null,
    movers: {
      gainers: sorted.filter((s) => s.changePercentage > 0).slice(0, 10),
      losers: sorted
        .filter((s) => s.changePercentage < 0)
        .slice(0, 10)
        .reverse(),
      mostActive: [...list].sort((a, b) => b.volume - a.volume).slice(0, 10),
    },
  };
}
// ─────────────────────────────────────────────────────────────────────────────

class RealTimeStockService {
  constructor() {
    this.baseURL = "https://www.cse.lk/api/";
    this.tradeSummaryCache = {
      quotes: [],
      fetchedAt: 0,
      source: "empty",
      isFallback: false,
      stale: false,
    };
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.cse.lk/",
        Origin: "https://www.cse.lk",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  _formatSymbol(symbol) {
    if (!symbol) return "";
    let sym = String(symbol).toUpperCase().trim();
    sym = SYMBOL_ALIASES[sym] || sym;
    // If it's a 3-4 letter ticker missing the .N0000 suffix, append it
    if (sym.length <= 5 && !sym.includes(".")) {
      sym = `${sym}.N0000`;
    }
    sym = SYMBOL_ALIASES[sym] || sym;
    return sym;
  }

  normalizeSymbol(symbol) {
    return this._formatSymbol(symbol);
  }

  _getFakeTradeSummaryQuotes() {
    return Object.entries(fakePrices).map(([symbol, state]) => {
      const change = parseFloat((state.price - state.openPrice).toFixed(2));
      const changePercentage = parseFloat(
        ((change / state.openPrice) * 100).toFixed(2),
      );

      return {
        symbol,
        lastTradedPrice: state.price,
        change,
        changePercentage,
        volume: state.totalVolume,
        marketCap: null,
      };
    });
  }

  _normalizeTradeSummaryPayload(payload) {
    const list = Array.isArray(payload)
      ? payload
      : (payload?.data ?? payload?.content ?? []);

    return list.map(buildQuoteFromTradeRow).filter(Boolean);
  }

  async _saveTradeSummarySnapshot(quotes) {
    if (!Array.isArray(quotes) || quotes.length === 0) return;

    try {
      await StockPrice.insertMany(
        quotes.map((quote) => ({
          symbol: quote.symbol,
          price: quote.lastTradedPrice,
          change: quote.change,
          changePercent: quote.changePercentage,
          volume: quote.volume,
          marketCap: quote.marketCap,
          timestamp: new Date(),
        })),
        { ordered: false },
      );
    } catch (error) {
      console.error("Error saving trade summary snapshot:", error.message);
    }
  }

  async _saveQuoteSnapshot(quotes) {
    if (!Array.isArray(quotes) || quotes.length === 0) return;

    try {
      await StockPrice.insertMany(
        quotes.map((quote) => ({
          symbol: quote.symbol,
          price: quote.lastTradedPrice,
          change: quote.change,
          changePercent: quote.changePercentage,
          volume: quote.volume,
          marketCap: quote.marketCap,
          timestamp: new Date(),
        })),
        { ordered: false },
      );
    } catch (error) {
      console.error("Error saving quote snapshot:", error.message);
    }
  }

  async _getStoredTradeSummary(symbols = []) {
    const normalizedSymbols = [
      ...new Set(
        symbols.map((symbol) => this._formatSymbol(symbol)).filter(Boolean),
      ),
    ];
    const matchStage =
      normalizedSymbols.length > 0
        ? { symbol: { $in: normalizedSymbols } }
        : {};

    const rows = await StockPrice.aggregate([
      { $match: matchStage },
      { $sort: { symbol: 1, timestamp: -1 } },
      {
        $group: {
          _id: "$symbol",
          symbol: { $first: "$symbol" },
          lastTradedPrice: { $first: "$price" },
          change: { $first: "$change" },
          changePercentage: { $first: "$changePercent" },
          volume: { $first: "$volume" },
          marketCap: { $first: "$marketCap" },
          timestamp: { $first: "$timestamp" },
        },
      },
      { $sort: { symbol: 1 } },
    ]);

    const fetchedAt = rows.reduce((latest, row) => {
      const ts = row?.timestamp ? new Date(row.timestamp).getTime() : 0;
      return Math.max(latest, ts);
    }, 0);

    return {
      quotes: rows.map((row) => ({
        symbol: row.symbol,
        lastTradedPrice: normalizeNumber(row.lastTradedPrice),
        change: normalizeNumber(row.change),
        changePercentage: normalizeNumber(row.changePercentage),
        volume: normalizeNumber(row.volume),
        marketCap: normalizeNumber(row.marketCap),
      })),
      fetchedAt,
    };
  }

  async _fetchOfficialTradeSummary() {
    const response = await this.client.post("tradeSummary");
    const quotes = this._normalizeTradeSummaryPayload(response.data);

    if (quotes.length === 0) {
      throw new Error("CSE tradeSummary returned no quotes");
    }

    this.tradeSummaryCache = {
      quotes,
      fetchedAt: Date.now(),
      source: "cse",
      isFallback: false,
      stale: false,
    };

    await this._saveTradeSummarySnapshot(quotes);

    return this.tradeSummaryCache;
  }

  async _getTradeSummarySnapshot(options = {}) {
    const {
      maxAgeMs = QUOTE_CACHE_TTL_MS,
      allowStaleCache = true,
      allowStoredFallback = true,
      allowSimulatedFallback = true,
      symbols = [],
    } = options;

    const now = Date.now();
    const hasFreshCache =
      this.tradeSummaryCache.quotes.length > 0 &&
      now - this.tradeSummaryCache.fetchedAt < maxAgeMs;

    if (hasFreshCache) {
      return { ...this.tradeSummaryCache };
    }

    try {
      return await this._fetchOfficialTradeSummary();
    } catch (error) {
      if (allowStaleCache && this.tradeSummaryCache.quotes.length > 0) {
        warnOnce(
          "tradeSummary-stale-cache",
          `[CSE] tradeSummary refresh failed (${error.message}) — using cached CSE prices`,
        );
        return {
          ...this.tradeSummaryCache,
          stale: true,
          source: this.tradeSummaryCache.source || "cse-cache",
        };
      }

      if (allowStoredFallback) {
        const stored = await this._getStoredTradeSummary(symbols);
        if (stored.quotes.length > 0) {
          warnOnce(
            "tradeSummary-db-cache",
            `[CSE] tradeSummary refresh failed (${error.message}) — using last stored CSE snapshot`,
          );
          return {
            quotes: stored.quotes,
            fetchedAt: stored.fetchedAt,
            source: "db-cache",
            isFallback: false,
            stale: true,
          };
        }
      }

      if (!allowSimulatedFallback) {
        warnOnce(
          `tradeSummary-empty:${error.message}`,
          `[CSE] tradeSummary unavailable (${error.message}) — no official quotes available yet`,
        );
        return {
          quotes: [],
          fetchedAt: null,
          source: "cse-unavailable",
          isFallback: false,
          stale: true,
        };
      }

      if (allowSimulatedFallback) {
        warnOnce("tradeSummary", "[CSE] getTradeSummary failed — GBM fallback");
        return {
          quotes: this._getFakeTradeSummaryQuotes(),
          fetchedAt: Date.now(),
          source: "gbm",
          isFallback: true,
          stale: false,
        };
      }

      throw error;
    }
  }

  async _fetchOfficialQuotesForSymbols(symbols) {
    const normalizedSymbols = [
      ...new Set(
        symbols.map((symbol) => this._formatSymbol(symbol)).filter(Boolean),
      ),
    ];

    if (normalizedSymbols.length === 0) {
      return { quotes: [], fetchedAt: null };
    }

    const results = await Promise.all(
      normalizedSymbols.map((symbol) =>
        this.getStockInfo(symbol, { allowSimulatedFallback: false }),
      ),
    );

    const quotes = results.filter(
      (quote) => quote && normalizeNumber(quote.lastTradedPrice) != null,
    );

    if (quotes.length > 0) {
      await this._saveQuoteSnapshot(quotes);
    }

    return {
      quotes,
      fetchedAt: quotes.length > 0 ? new Date() : null,
    };
  }

  async getQuotesForSymbols(symbols, options = {}) {
    const requestedSymbols = [
      ...new Set(
        symbols.map((symbol) => this._formatSymbol(symbol)).filter(Boolean),
      ),
    ];

    if (requestedSymbols.length === 0) {
      return {
        quotes: [],
        quoteMap: new Map(),
        fetchedAt: null,
        source: "empty",
        isFallback: false,
        stale: false,
      };
    }

    const snapshot = await this._getTradeSummarySnapshot({
      maxAgeMs: options.maxAgeMs,
      allowStaleCache: options.allowStaleCache,
      allowStoredFallback: options.allowStoredFallback,
      allowSimulatedFallback: options.allowSimulatedFallback,
      symbols: requestedSymbols,
    });

    const rawQuoteMap = new Map(
      snapshot.quotes.map((quote) => [quote.symbol, quote]),
    );

    const missingSymbols = requestedSymbols.filter(
      (symbol) => !rawQuoteMap.has(symbol),
    );

    let symbolQuoteSnapshot = { quotes: [], fetchedAt: null };
    if (missingSymbols.length > 0) {
      symbolQuoteSnapshot =
        await this._fetchOfficialQuotesForSymbols(missingSymbols);

      for (const quote of symbolQuoteSnapshot.quotes) {
        rawQuoteMap.set(quote.symbol, quote);
      }
    }

    const snapshotFetchedAt = snapshot.fetchedAt
      ? new Date(snapshot.fetchedAt)
      : null;
    const symbolFetchedAt = symbolQuoteSnapshot.fetchedAt
      ? new Date(symbolQuoteSnapshot.fetchedAt)
      : null;
    const latestFetchedAt = symbolFetchedAt || snapshotFetchedAt;
    const quotes = requestedSymbols
      .map((symbol) => {
        const quote = rawQuoteMap.get(symbol);
        if (!quote) return null;

        const quoteSource =
          quote.source ||
          (snapshot.quotes.some((item) => item.symbol === symbol)
            ? snapshot.source
            : "cse-symbol");
        const quotePriceAsOf =
          quote.priceAsOf ||
          (quoteSource === "cse-symbol" ? symbolFetchedAt : snapshotFetchedAt);
        const quoteStale =
          quote.stale ??
          (quoteSource === "cse-symbol" ? false : snapshot.stale);

        return {
          ...quote,
          source: quoteSource,
          priceAsOf: quotePriceAsOf,
          isFallback: quote.isFallback ?? snapshot.isFallback,
          stale: quoteStale,
        };
      })
      .filter(Boolean);

    return {
      quotes,
      quoteMap: new Map(quotes.map((quote) => [quote.symbol, quote])),
      fetchedAt: latestFetchedAt,
      source:
        symbolQuoteSnapshot.quotes.length > 0 && snapshot.quotes.length === 0
          ? "cse-symbol"
          : snapshot.source,
      isFallback: snapshot.isFallback,
      stale: symbolQuoteSnapshot.quotes.length > 0 ? false : snapshot.stale,
    };
  }

  async getStockInfo(symbol, options = {}) {
    const formattedSymbol = this._formatSymbol(symbol);
    const { allowSimulatedFallback = true } = options;
    try {
      const params = new URLSearchParams();
      params.append("symbol", formattedSymbol);
      const response = await this.client.post("companyInfoSummery", params);
      const data = response.data;

      if (!data || !data.reqSymbolInfo) {
        throw new Error(`Invalid response for ${formattedSymbol}`);
      }

      return {
        symbol: data.reqSymbolInfo?.symbol || formattedSymbol,
        name: data.reqSymbolInfo?.name || "",
        lastTradedPrice: data.reqSymbolInfo?.lastTradedPrice || null,
        change: data.reqSymbolInfo?.change || 0,
        changePercentage: data.reqSymbolInfo?.changePercentage || 0,
        marketCap: data.reqSymbolInfo?.marketCap || null,
        beta: data.reqSymbolBetaInfo?.betaValueSPSL || null,
        logo: data.reqLogo ? `https://www.cse.lk/${data.reqLogo.path}` : null,
        source: "cse-symbol",
        stale: false,
      };
    } catch (error) {
      if (!allowSimulatedFallback) {
        warnOnce(
          `stock-official:${formattedSymbol}:${error.message}`,
          `[CSE] getStockInfo unavailable for ${formattedSymbol} (${error.message})`,
        );
        return null;
      }

      warnOnce(
        `stock:${formattedSymbol}:${error.message}`,
        `[CSE] getStockInfo failed for ${formattedSymbol} (${error.message}) — GBM fallback`,
      );
      return getFakeStockInfo(formattedSymbol);
    }
  }

  async getTradeSummary() {
    const snapshot = await this._getTradeSummarySnapshot();
    return snapshot.quotes;
  }

  async getTopGainers() {
    try {
      return (await this.client.post("topGainers")).data;
    } catch {
      return null;
    }
  }

  async getTopLosers() {
    try {
      return (await this.client.post("topLooses")).data;
    } catch {
      return null;
    }
  }

  async getMostActive() {
    try {
      return (await this.client.post("mostActiveTrades")).data;
    } catch {
      return null;
    }
  }

  async getMarketSummary() {
    try {
      return (await this.client.post("marketSummery")).data;
    } catch {
      return null;
    }
  }

  async getASPI() {
    try {
      return (await this.client.post("aspiData")).data;
    } catch {
      return null;
    }
  }

  async getSNP() {
    try {
      return (await this.client.post("snpData")).data;
    } catch {
      return null;
    }
  }

  async getChartData(symbol, period = "1M") {
    try {
      const params = new URLSearchParams();
      params.append("symbol", symbol);
      params.append("period", period);
      return (await this.client.post("chartData", params)).data;
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getPriceForSymbol(symbol) {
    const { quoteMap } = await this.getQuotesForSymbols([symbol], {
      allowSimulatedFallback: true,
    });
    const quote = quoteMap.get(this._formatSymbol(symbol));
    return quote?.lastTradedPrice ?? null;
  }

  startRealTimePolling(intervalSeconds = 3600) {
    console.log(
      `📊 Starting CSE price polling every ${intervalSeconds / 60} minutes...`,
    );
    this._pollMarketData();
    setInterval(() => this._pollMarketData(), intervalSeconds * 1000);
  }

  async _pollMarketData() {
    try {
      await Promise.all([
        this._fetchOfficialTradeSummary().catch(() => null),
        this.getTopGainers(),
        this.getTopLosers(),
        this.getMostActive(),
      ]);
      console.log(
        `📈 CSE market data refreshed at ${new Date().toLocaleTimeString()}`,
      );
    } catch (error) {
      console.error("Market data polling error:", error.message);
    }
  }

  async saveStockPrice(
    symbol,
    price,
    change = null,
    changePercent = null,
    volume = null,
    marketCap = null,
  ) {
    try {
      const stockPrice = new StockPrice({
        symbol,
        price,
        change,
        changePercent,
        volume,
        marketCap,
        timestamp: new Date(),
      });
      await stockPrice.save();
      return stockPrice;
    } catch (error) {
      console.error("Error saving stock price:", error.message);
      return null;
    }
  }

  async getMarketSnapshot() {
    try {
      const [summary, aspi, snp, gainers, losers, active] = await Promise.all([
        this.getMarketSummary(),
        this.getASPI(),
        this.getSNP(),
        this.getTopGainers(),
        this.getTopLosers(),
        this.getMostActive(),
      ]);

      // If ALL CSE sub-calls returned null, fall through to GBM fallback
      if (!summary && !aspi && !snp && !gainers && !losers && !active) {
        throw new Error("All CSE endpoints returned null");
      }

      return {
        success: true,
        timestamp: new Date(),
        indices: {
          aspi: Array.isArray(aspi) ? aspi[0] : aspi,
          snp: Array.isArray(snp) ? snp[0] : snp,
        },
        marketSummary: summary,
        movers: {
          gainers: gainers?.slice(0, 10) || [],
          losers: losers?.slice(0, 10) || [],
          mostActive: active?.slice(0, 10) || [],
        },
      };
    } catch {
      warnOnce(
        "marketSnapshot",
        "[CSE] getMarketSnapshot — returning GBM simulated data",
      );
      return getFakeMarketSnapshot();
    }
  }
}

export default new RealTimeStockService();
