import { useState } from "react";
import Header from "../components/layout/Header";
import { compareCompanies } from "../api/compareApi.js";

const Compare = () => {
  const [symbols, setSymbols] = useState([
    "JKH.N0000",
    "COMB.N0000",
    "HNB.N0000",
  ]);
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleCompare = async () => {
    const validSymbols = symbols
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (validSymbols.length < 2) {
      setError("Please enter at least 2 company symbols.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await compareCompanies(validSymbols, year, "ANNUAL");
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Comparison failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const ratioRows = [
    { key: "pe", label: "P/E Ratio", higherIsBetter: false },
    { key: "pb", label: "P/B Ratio", higherIsBetter: false },
    { key: "peg", label: "PEG Ratio", higherIsBetter: false },
    { key: "earningsYield", label: "Earnings Yield (%)", higherIsBetter: true },
    { key: "dividendYield", label: "Dividend Yield (%)", higherIsBetter: true },
    { key: "roePercent", label: "ROE (%)", higherIsBetter: true },
    { key: "roaPercent", label: "ROA (%)", higherIsBetter: true },
    { key: "eps", label: "EPS (LKR)", higherIsBetter: true },
    { key: "debtToEquity", label: "Debt / Equity", higherIsBetter: false },
    { key: "currentRatio", label: "Current Ratio", higherIsBetter: true },
    { key: "quickRatio", label: "Quick Ratio", higherIsBetter: true },
    {
      key: "grossProfitMarginPercent",
      label: "Profit Margin (%)",
      higherIsBetter: true,
    },
    { key: "epsGrowthPercent", label: "EPS Growth (%)", higherIsBetter: true },
  ];

  const companies = result?.companies || [];

  const getRatioIdx = (key, higherIsBetter, mode) => {
    const nums = companies.map((c) => {
      const v = c.missing ? null : c.ratios?.[key];
      return v != null ? Number(v) : null;
    });
    const valid = nums.filter((n) => n != null && isFinite(n));
    if (valid.length < 2) return -1;
    const target =
      (mode === "best") === higherIsBetter
        ? Math.max(...valid)
        : Math.min(...valid);
    return nums.findIndex((n) => n === target);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 animate-fadeIn">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="premium-gradient p-12 rounded-3xl text-center mb-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">Company Comparison</h1>
          <p className="text-lg text-blue-100/90 font-medium max-w-2xl mx-auto">
            Compare up to 3 CSE-listed companies with live financial data + AI
            insights
          </p>
        </div>

        {/* Selection form */}
        <div className="card mb-8 animate-slideUp">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-xl">📊</span> Select Companies to Compare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  Company {i + 1}
                </label>
                <input
                  type="text"
                  value={symbols[i]}
                  onChange={(e) => {
                    const updated = [...symbols];
                    updated[i] = e.target.value;
                    setSymbols(updated);
                  }}
                  placeholder="e.g. JKH.N0000"
                  className="input"
                />
              </div>
            ))}
            <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Fiscal Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="input"
                min="2018"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <button
            onClick={handleCompare}
            disabled={loading}
            className={`btn btn-primary w-full md:w-auto shadow-lg shadow-blue-600/20 ${loading ? 'animate-pulse' : ''}`}
          >
            {loading ? "Comparing..." : "Compare Companies"}
          </button>
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Results table */}
        {result && (
          <>
            <div className="card mb-8 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <span className="text-xl">🏆</span> Comparison Results – {year}
              </h2>

              {/* Live prices row */}
              <div
                className="grid gap-6 mb-8 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10"
                style={{
                  gridTemplateColumns: `repeat(${companies.length + 1}, 1fr)`,
                }}
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 self-center">
                  Live Price (LKR)
                </div>
                {companies.map((c) => (
                  <div
                    key={c.symbol}
                    className="font-black text-blue-400 text-2xl text-glow"
                  >
                    {c.missing
                      ? "—"
                      : c.lastPrice != null
                        ? c.lastPrice.toFixed(2)
                        : "Market closed"}
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-500 border-b border-white/5">
                        Financial Ratio
                      </th>
                      {companies.map((c) => (
                        <th
                          key={c.symbol}
                          className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-500 border-b border-white/5"
                        >
                          {c.symbol}
                          {c.missing && (
                            <span className="ml-2 text-red-500/50 text-[8px] font-black">
                              (NO DATA)
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ratioRows.map((row, idx) => {
                      const bestIdx = getRatioIdx(
                        row.key,
                        row.higherIsBetter,
                        "best",
                      );
                      const worstIdx = getRatioIdx(
                        row.key,
                        row.higherIsBetter,
                        "worst",
                      );
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm font-bold text-slate-300">
                            {row.label}
                          </td>
                          {companies.map((c, cIdx) => {
                            const val = c.ratios?.[row.key];
                            const isBest = !c.missing && cIdx === bestIdx;
                            const isWorst = !c.missing && cIdx === worstIdx;
                            return (
                              <td
                                key={c.symbol}
                                className={`px-6 py-4 text-sm font-black transition-all duration-300 ${
                                  isBest
                                    ? "text-green-400 bg-green-500/5"
                                    : isWorst
                                      ? "text-red-400 bg-red-500/5"
                                      : "text-slate-400"
                                }`}
                              >
                                {c.missing ? "—" : val != null ? val : "N/A"}
                                {isBest && (
                                  <span className="ml-2 text-[10px]">▲</span>
                                )}
                                {isWorst && (
                                  <span className="ml-2 text-[10px]">▼</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 px-3 py-1.5 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-green-400/80">Optimal Value</span>
                </div>
                <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-3 py-1.5 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80">Underperforming</span>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {result.aiInsights && (
              <div className="glass-card p-8 rounded-3xl border border-blue-500/20 mb-8 animate-fadeIn">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">🤖</span> AI Investment Insights
                </h2>
                <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/5 backdrop-blur-xl relative group">
                  <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-blue-500/50 group-hover:text-blue-500 transition-colors">Analytical Report</div>
                  <pre className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-sans mt-4">
                    {result.aiInsights}
                  </pre>
                </div>
                <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Powered by OpenSource Intelligence + Invezt Core</span>
                  <span>FY {year} Analysis</span>
                </div>
              </div>
            )}

            {!result.aiInsights && companies.some((c) => !c.missing) && (
              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl animate-shake">
                <p className="text-amber-400 text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span> AI insights unavailable — complete financial data for these companies may not be in our database yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;
