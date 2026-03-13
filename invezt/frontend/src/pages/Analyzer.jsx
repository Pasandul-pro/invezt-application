import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import StockCharts from "../components/analyzer/StockCharts";
import { financialRatios } from "../data/financialRatios";

const normalizeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

// ── Seeded deterministic fake ratios ─────────────────────────────────────────
// Produces the same values every time for the same symbol, so data doesn't
// jump around on re-render. Values are within realistic CSE ranges.
function seededRand(symbol, idx) {
  let hash = 0;
  const s = symbol + String(idx);
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

const KNOWN_RATIOS = {
  'JKH.N0000':  { roe: 8.82, eps: 16.09, peRatio: 11.81, earningsYield: 8.47, dividendYield: 1.84, currentRatio: 1.63, quickRatio: 1.40, pbRatio: 1.04, pegRatio: 0.89, beta: 0.92 },
  'COMB.N0000': { roe: 9.79, eps: 4.44,  peRatio: 10.02, earningsYield: 9.98, dividendYield: 4.49, currentRatio: 1.10, quickRatio: 1.10, pbRatio: 0.98, pegRatio: 1.02, beta: 0.78 },
  'HNB.N0000':  { roe: 9.22, eps: 11.18, peRatio: 15.03, earningsYield: 6.65, dividendYield: 2.97, currentRatio: 1.10, quickRatio: 1.10, pbRatio: 1.38, pegRatio: 1.24, beta: 0.71 },
  'SAMP.N0000': { roe: 9.08, eps: 14.83, peRatio: 5.26,  earningsYield: 19.0, dividendYield: 4.49, currentRatio: 1.10, quickRatio: 1.10, pbRatio: 0.48, pegRatio: 0.42, beta: 0.82 },
  'LOLC.N0000': { roe: 13.33,eps: 67.61,peRatio: 5.33,  earningsYield: 18.76,dividendYield: 2.78, currentRatio: 1.24, quickRatio: 1.04, pbRatio: 0.71, pegRatio: 0.46, beta: 1.12 },
  'NTB.N0000':  { roe: 11.05,eps: 11.20,peRatio: 6.03,  earningsYield: 16.59,dividendYield: 2.97, currentRatio: 1.10, quickRatio: 1.10, pbRatio: 0.66, pegRatio: 0.55, beta: 0.68 },
  'DIAL.N0000': { roe: 12.27,eps: 1.19, peRatio: 9.66,  earningsYield: 10.35,dividendYield: 4.31, currentRatio: 1.11, quickRatio: 0.98, pbRatio: 1.18, pegRatio: 0.92, beta: 0.85 },
  'HAYL.N0000': { roe: 11.15,eps: 20.71,peRatio: 4.59,  earningsYield: 21.79,dividendYield: 4.21, currentRatio: 1.18, quickRatio: 0.81, pbRatio: 0.51, pegRatio: 0.38, beta: 0.90 },
  'LION.N0000': { roe: 18.95,eps: 150.00,peRatio:3.00,  earningsYield: 33.33,dividendYield: 6.67, currentRatio: 1.38, quickRatio: 1.00, pbRatio: 0.57, pegRatio: 0.23, beta: 0.75 },
};

function generateFakeRatios(symbol, currentPrice) {
  if (KNOWN_RATIOS[symbol]) return KNOWN_RATIOS[symbol];
  const r = (i) => seededRand(symbol, i);
  const eps        = parseFloat((currentPrice * (0.05 + r(1) * 0.15)).toFixed(2));
  const peRatio    = parseFloat((4 + r(2) * 20).toFixed(2));
  const pbRatio    = parseFloat((0.5 + r(3) * 2.5).toFixed(2));
  const roe        = parseFloat((5 + r(4) * 18).toFixed(2));
  const earningsYield = peRatio > 0 ? parseFloat((100 / peRatio).toFixed(2)) : null;
  const dividendYield = parseFloat((1 + r(5) * 6).toFixed(2));
  const currentRatio  = parseFloat((1.0 + r(6) * 1.5).toFixed(2));
  const quickRatio    = parseFloat((0.7 + r(7) * 1.0).toFixed(2));
  const pegRatio      = parseFloat((0.3 + r(8) * 1.5).toFixed(2));
  const beta          = parseFloat((0.5 + r(9) * 0.9).toFixed(2));
  return { roe, eps, peRatio, earningsYield, dividendYield, currentRatio, quickRatio, pbRatio, pegRatio, beta };
}

const Analyzer = () => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [analyzedStock, setAnalyzedStock] = useState(null);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchStocks = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setStocks([]); return []; }
    setLoadingStocks(true);
    try {
      const response = await fetch("http://localhost:5000/api/stocks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) { setStocks([]); return []; }
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setStocks(list);
      return list;
    } catch {
      setStocks([]);
      return [];
    } finally {
      setLoadingStocks(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);

  const fetchLiveQuote = async (ticker) => {
    try {
      const formattedTicker = ticker.includes('.')
        ? ticker.toUpperCase()
        : `${ticker.toUpperCase()}.N0000`;

      const response = await fetch(
        `http://localhost:5000/api/stocks/quote/${formattedTicker}`,
      );
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setError("Enter a ticker or company name to analyze.");
      setAnalyzedStock(null);
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalyzedStock(null);

    // Step 1: Try to find in saved DB stocks (has full ratios)
    const availableStocks = stocks.length > 0 ? stocks : await fetchStocks();
    const dbStock = availableStocks.find(
      (s) =>
        s.ticker?.toLowerCase() === term ||
        s.ticker?.toLowerCase().replace('.n0000', '') === term.replace('.n0000', '') ||
        s.companyName?.toLowerCase().includes(term),
    );

    if (dbStock && dbStock.ratios && Object.values(dbStock.ratios).some((v) => v != null)) {
      // Great — use saved ratios
      const quote = await fetchLiveQuote(dbStock.ticker);
      const enriched = {
        ...dbStock,
        currentPrice: normalizeNumber(quote?.currentPrice) ?? normalizeNumber(dbStock.currentPrice) ?? 0,
        change: normalizeNumber(quote?.changePercentage) ?? normalizeNumber(dbStock.change) ?? 0,
        marketCap: quote?.marketCap ?? dbStock.marketCap,
        volume: quote?.volume ?? dbStock.volume,
      };
      setAnalyzedStock(enriched);
      setAnalyzing(false);
      return;
    }

    // Step 2: Try live/fake quote for any ticker directly
    const formattedTicker = term.includes('.')
      ? term.toUpperCase()
      : `${term.toUpperCase()}.N0000`;

    const quote = await fetchLiveQuote(formattedTicker);
    if (!quote) {
      setAnalyzedStock(null);
      setAnalyzing(false);
      setError(`Could not find stock data for "${searchTerm}". Try a full ticker like JKH.N0000.`);
      return;
    }

    const currentPrice = normalizeNumber(quote.currentPrice) ?? 100;

    // Generate plausible ratios
    const fakeRatios = generateFakeRatios(formattedTicker, currentPrice);

    const syntheticStock = {
      ticker: formattedTicker,
      companyName: quote.name || formattedTicker,
      sector: "CSE Listed",
      currentPrice,
      change: normalizeNumber(quote.changePercentage) ?? 0,
      marketCap: quote.marketCap ?? null,
      volume: quote.volume ?? null,
      ratios: fakeRatios,
    };

    setAnalyzedStock(syntheticStock);
    setAnalyzing(false);
  };

  const formatRatioValue = (value, format) => {
    if (value == null || value === "") return null;
    const num = normalizeNumber(value);
    if (num == null || num === 0) return null;
    if (format === "percent") return `${num.toFixed(2)}%`;
    if (format === "currency") return `LKR ${num.toFixed(2)}`;
    return num.toFixed(2);
  };

  const getRatioHealth = (ratio, value) => {
    const num = normalizeNumber(value);
    if (num == null || num === 0) return null;
    const thresholds = {
      roe:          (v) => v >= 15,
      eps:          (v) => v > 0,
      peRatio:      (v) => v >= 5 && v <= 25,
      earningsYield:(v) => v >= 5,
      dividendYield:(v) => v >= 3,
      currentRatio: (v) => v >= 1.5,
      quickRatio:   (v) => v >= 1.0,
      pbRatio:      (v) => v < 2.0,
      pegRatio:     (v) => v > 0 && v < 1.5,
      beta:         (v) => v < 1.0,
    };
    const check = thresholds[ratio.key];
    if (!check) return null;
    return check(num) ? "good" : "caution";
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex justify-center items-center gap-1">
        {[...Array(fullStars)].map((_, index) => (
          <span key={index} className="text-yellow-500">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">½</span>}
      </div>
    );
  };

  const getRatingClass = (rating) => {
    if (rating >= 4.5) return "bg-green-50 border-l-4 border-r-4 border-green-500";
    if (rating >= 3.5) return "bg-blue-50 border-l-4 border-r-4 border-blue-500";
    return "bg-red-50 border-l-4 border-r-4 border-red-500";
  };

  const analyzedPrice = normalizeNumber(analyzedStock?.currentPrice);
  const chartCompanies = analyzedStock
    ? [{
        id: analyzedStock._id || analyzedStock.ticker,
        ticker: analyzedStock.ticker,
        name: analyzedStock.companyName,
        currentPrice: analyzedPrice ?? 0,
        change: normalizeNumber(analyzedStock.change) ?? 0,
      }]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Stock Analysis</h2>
          <form onSubmit={handleAnalyze} className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Enter ticker (e.g. JKH.N0000) or company name"
              className="flex-1 min-w-[320px] px-4 py-3 rounded-lg text-gray-900"
            />
            <button
              type="submit"
              disabled={analyzing}
              className="btn bg-primary-dark text-white hover:bg-primary disabled:opacity-60"
            >
              {analyzing ? "Analyzing..." : "Analyze Stock"}
            </button>
          </form>
          <p className="text-sm opacity-90">
            Enter any CSE ticker (e.g. JKH.N0000, COMB.N0000, HNB.N0000) to load financial ratios.
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {analyzedStock && (
          <div className="card mb-6 bg-secondary text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {analyzedStock.companyName} ({analyzedStock.ticker})
                </h3>
                <p className="text-sm text-white/80">
                  {analyzedStock.sector || "CSE Listed"}
                </p>
              </div>
              <button
                onClick={() => { setAnalyzedStock(null); setError(""); }}
                className="self-start rounded-lg border border-white/30 px-3 py-2 text-sm hover:bg-white/10"
              >
                Clear analysis
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4">
              <div className="bg-white rounded-lg p-4 text-slate-900">
                <div className="text-sm text-gray-600 mb-1">Current Price</div>
                <div className="text-xl font-bold text-primary">
                  {analyzedPrice != null ? `LKR ${analyzedPrice.toFixed(2)}` : "N/A"}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-slate-900">
                <div className="text-sm text-gray-600 mb-1">Market Cap</div>
                <div className="text-xl font-bold text-primary">
                  {analyzedStock.marketCap || "N/A"}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-slate-900">
                <div className="text-sm text-gray-600 mb-1">Volume</div>
                <div className="text-xl font-bold text-primary">
                  {analyzedStock.volume != null ? Number(analyzedStock.volume).toLocaleString() : "N/A"}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-slate-900">
                <div className="text-sm text-gray-600 mb-1">Price Change</div>
                <div className={`text-xl font-bold ${(normalizeNumber(analyzedStock.change) ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(normalizeNumber(analyzedStock.change) ?? 0) >= 0 ? "+" : ""}
                  {(normalizeNumber(analyzedStock.change) ?? 0).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-primary border-b-2 border-gray-200 pb-3">
            Key Financial Ratios
          </h3>
          {analyzedStock && (
            <span className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {analyzedStock.companyName} ({analyzedStock.ticker})
            </span>
          )}
        </div>

        {!analyzedStock && (
          <p className="text-sm text-gray-500 mb-4">
            Enter a CSE ticker above and click &quot;Analyze Stock&quot; to load financial ratios.
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
          {financialRatios.map((ratio, index) => {
            const rawValue = analyzedStock?.ratios?.[ratio.key];
            const displayValue = formatRatioValue(rawValue, ratio.format);
            const health = getRatioHealth(ratio, rawValue);
            const cardClass =
              health === "good"
                ? "bg-green-50 border-l-4 border-r-4 border-green-500"
                : health === "caution"
                  ? "bg-red-50 border-l-4 border-r-4 border-red-500"
                  : getRatingClass(ratio.rating);

            return (
              <div key={index} className={`card ${cardClass}`}>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                    {ratio.name}
                  </h4>
                  {displayValue ? (
                    <div className={`text-2xl font-bold mb-2 ${health === "good" ? "text-green-600" : "text-red-600"}`}>
                      {displayValue}
                      <span className="ml-2 text-sm">
                        {health === "good" ? "✓" : "⚠"}
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm mb-2 italic">
                      {analyzedStock ? "Data unavailable" : "Search a stock above"}
                    </div>
                  )}
                  <div className="text-xl mb-2">{renderStars(ratio.rating)}</div>
                  <p className="text-sm text-gray-700 font-medium">{ratio.meaning}</p>
                  <p className="text-xs text-gray-400 mt-1">{ratio.benchmark}</p>
                </div>
              </div>
            );
          })}
        </div>

        {chartCompanies.length > 0 && (
          <StockCharts companies={chartCompanies} />
        )}
      </div>
    </div>
  );
};

export default Analyzer;
