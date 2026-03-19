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
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-900/40 to-blue-600/20 border border-blue-500/30 text-white rounded-2xl p-12 text-center mb-8 backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-4">Company Comparison</h1>
          <p className="text-lg opacity-90 text-blue-100">
            Compare up to 3 CSE-listed companies with live financial data + AI
            insights
          </p>
        </div>

        {/* Selection form */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Select Companies to Compare
          </h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
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
            className="btn btn-primary bg-blue-600 hover:bg-blue-500"
          >
            {loading ? "Comparing..." : "Compare Companies"}
          </button>
          {error && (
            <div className="mt-4 bg-red-900/20 border-l-4 border-red-500 p-3 rounded text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results table */}
        {result && (
          <>
            <div className="card mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Comparison Results – {year}
              </h2>

              {/* Live prices row */}
              <div
                className="grid gap-4 mb-6"
                style={{
                  gridTemplateColumns: `repeat(${companies.length + 1}, 1fr)`,
                }}
              >
                <div className="font-semibold text-slate-400">
                  Live Price (LKR)
                </div>
                {companies.map((c) => (
                  <div
                    key={c.symbol}
                    className="font-bold text-blue-400 text-lg"
                  >
                    {c.missing
                      ? "—"
                      : c.lastPrice != null
                        ? c.lastPrice.toFixed(2)
                        : "Market closed"}
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <thead>
                    <tr className="bg-slate-900/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-400">
                        Financial Ratio
                      </th>
                      {companies.map((c) => (
                        <th
                          key={c.symbol}
                          className="px-6 py-4 text-left text-sm font-semibold text-blue-400"
                        >
                          {c.symbol}
                          {c.missing && (
                            <span className="ml-2 text-red-400 text-xs font-normal">
                              (no data)
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  </thead>
                  <tbody>
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
                          className="border-b border-slate-800 hover:bg-white/5"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-slate-100">
                            {row.label}
                          </td>
                          {companies.map((c, cIdx) => {
                            const val = c.ratios?.[row.key];
                            const isBest = !c.missing && cIdx === bestIdx;
                            const isWorst = !c.missing && cIdx === worstIdx;
                            return (
                              <td
                                key={c.symbol}
                                className={`px-6 py-4 text-sm font-semibold ${
                                  isBest
                                    ? "text-green-400 bg-green-900/20"
                                    : isWorst
                                      ? "text-red-400 bg-red-900/20"
                                      : "text-slate-300"
                                }`}
                              >
                                {c.missing ? "—" : val != null ? val : "N/A"}
                                {isBest && (
                                  <span className="ml-1 text-xs font-bold text-green-500">
                                    ▲
                                  </span>
                                )}
                                {isWorst && (
                                  <span className="ml-1 text-xs font-bold text-red-500">
                                    ▼
                                  </span>
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
              <div className="mt-4 flex gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-green-900/30 border border-green-500/50"></span>{" "}
                  Best value for this ratio
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-red-900/30 border border-red-500/50"></span>{" "}
                  Weakest value for this ratio
                </span>
              </div>
            </div>

            {/* AI Insights */}
            {result.aiInsights && (
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">
                  🤖 AI Investment Insights
                </h2>
                <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-sans">
                    {result.aiInsights}
                  </pre>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Powered by GPT-4o · Based on {year} annual financials
                </p>
              </div>
            )}

            {!result.aiInsights && companies.some((c) => !c.missing) && (
              <div className="card bg-yellow-900/20 border-l-4 border-yellow-500">
                <p className="text-yellow-200 text-sm">
                  ⚠ AI insights unavailable — financial data for these companies
                  may not yet be in the database. The live CSE prices and ratios
                  above are calculated from available data.
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
