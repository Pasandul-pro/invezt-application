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
    if (rating >= 4.5) return "bg-green-900/20 border-l-4 border-r-4 border-green-500/50";
    if (rating >= 3.5) return "bg-blue-900/20 border-l-4 border-r-4 border-blue-500/50";
    return "bg-red-900/20 border-l-4 border-r-4 border-red-500/50";
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
    <div className="min-h-screen bg-[#0f172a] text-slate-100 animate-fadeIn">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="premium-gradient p-12 rounded-3xl text-center mb-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">Stock Analysis &amp; Ratios</h1>
          <p className="text-lg text-blue-100/90 font-medium max-w-2xl mx-auto mb-8">
            Deep dive into Colombo Stock Exchange financials with real-time valuation metrics
          </p>
          
          <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 relative z-10">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="e.g. JKH.N0000 or Commercial Bank"
              className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-blue-100/50 backdrop-blur-md focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={analyzing}
              className="btn bg-white text-blue-900 hover:bg-blue-50 font-black px-8 py-4 rounded-2xl shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : "Analyze Stock"}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 inline-block bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-200 text-xs font-bold animate-shake">
              ⚠️ {error}
            </div>
          )}
        </div>

        {analyzedStock && (
          <div className="glass-card p-10 rounded-3xl mb-12 animate-slideUp">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-600/30">
                  {analyzedStock.ticker?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2">
                    {analyzedStock.companyName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                      {analyzedStock.ticker}
                    </span>
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                      {analyzedStock.sector || "CSE Listed"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setAnalyzedStock(null); setError(""); }}
                className="self-center bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
              >
                Clear Results
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Current Price", value: analyzedPrice != null ? `LKR ${analyzedPrice.toFixed(2)}` : "N/A", icon: "💎" },
                { label: "Market Cap", value: analyzedStock.marketCap || "N/A", icon: "🏢" },
                { label: "Volume", value: analyzedStock.volume != null ? Number(analyzedStock.volume).toLocaleString() : "N/A", icon: "📊" },
                { 
                  label: "Price Change", 
                  value: `${(normalizeNumber(analyzedStock.change) ?? 0) >= 0 ? "+" : ""}${(normalizeNumber(analyzedStock.change) ?? 0).toFixed(2)}%`, 
                  icon: "📈",
                  color: (normalizeNumber(analyzedStock.change) ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                    <span className="opacity-30 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">{stat.icon}</span>
                  </div>
                  <div className={`text-xl font-black ${stat.color || "text-white"} text-glow tracking-tight`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 no-print">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Financial Health Ratios
          </h3>
          {analyzedStock && (
            <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-400 text-xs font-black uppercase tracking-widest animate-fadeIn">
              Showing Data For: {analyzedStock.companyName}
            </div>
          )}
        </div>

        {!analyzedStock && (
          <p className="text-sm text-slate-500 mb-4">
            Enter a CSE ticker above and click &quot;Analyze Stock&quot; to load financial ratios.
          </p>
        )}

        <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-3">
          {financialRatios.map((ratio, index) => {
            const rawValue = analyzedStock?.ratios?.[ratio.key];
            const displayValue = formatRatioValue(rawValue, ratio.format);
            const health = getRatioHealth(ratio, rawValue);
            
            return (
              <div key={index} className="glass-card p-8 rounded-3xl hover:scale-[1.02] hover:glow-blue transition-all duration-300 animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="text-center">
                  <h4 className="font-black text-white mb-6 text-sm uppercase tracking-widest">
                    {ratio.name}
                  </h4>
                  {displayValue ? (
                    <div className="flex flex-col items-center mb-6">
                       <div className={`text-4xl font-black mb-1 text-glow ${health === "good" ? "text-green-400" : "text-rose-500"}`}>
                        {displayValue}
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${health === "good" ? "bg-green-500/10 text-green-400" : "bg-rose-500/10 text-rose-500"}`}>
                        {health === "good" ? "Strong Indicator" : "Needs Review"}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 py-8 rounded-2xl border border-dashed border-slate-800 text-slate-600 text-[10px] font-black uppercase tracking-widest mb-6">
                      {analyzedStock ? "Data Unavailable" : "Pending Analysis"}
                    </div>
                  )}
                  <div className="mb-6">{renderStars(ratio.rating)}</div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-slate-300 font-medium leading-relaxed mb-3">{ratio.meaning}</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{ratio.benchmark}</p>
                  </div>
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
