import { useState, useEffect, useMemo } from "react";
import Header from "../components/layout/Header";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  getPortfolios,
  createPortfolio,
  addHolding,
  removeHolding,
} from "../api/portfolioApi.js";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../api/watchlistApi.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

function formatSnapshotTime(value) {
  if (!value) return "Awaiting CSE snapshot";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Awaiting CSE snapshot";

  return date.toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatChartTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-LK", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildGrowthHistory(valueHistory) {
  if (!Array.isArray(valueHistory) || valueHistory.length === 0) {
    return {
      labels: [],
      values: [],
      investments: [],
    };
  }

  const sorted = [...valueHistory]
    .filter((entry) => entry?.recordedAt)
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );

  return {
    labels: sorted.map((entry) => formatChartTimestamp(entry.recordedAt)),
    values: sorted.map((entry) => Number(entry.totalValue || 0)),
    investments: sorted.map((entry) => Number(entry.totalInvestment || 0)),
  };
}

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState("");
  const [portfolioSnapshotMeta, setPortfolioSnapshotMeta] = useState({
    pricesUpdatedAt: null,
    priceSource: "cse",
    priceStale: false,
    refreshIntervalMinutes: 10,
  });

  const [newHolding, setNewHolding] = useState({
    companyTicker: "",
    companyName: "",
    shares: "",
    averageCost: "",
  });
  const [addingHolding, setAddingHolding] = useState(false);

  const [watchlistItems, setWatchlistItems] = useState([]);
  const [watchlistInput, setWatchlistInput] = useState("");
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [watchlistError, setWatchlistError] = useState("");
  const [watchlistSnapshotMeta, setWatchlistSnapshotMeta] = useState({
    pricesUpdatedAt: null,
    priceSource: "cse",
    priceStale: false,
    refreshIntervalMinutes: 10,
  });

  useEffect(() => {
    loadPortfolios();
    loadWatchlist();

    const intervalId = window.setInterval(() => {
      loadPortfolios();
      loadWatchlist();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoadingPortfolio(true);
      setPortfolioError("");
      const res = await getPortfolios();
      const data = res.data || [];
      setPortfolios(data);
      setPortfolioSnapshotMeta({
        pricesUpdatedAt: data[0]?.pricesUpdatedAt || null,
        priceSource: data[0]?.priceSource || "cse",
        priceStale: Boolean(data[0]?.priceStale),
        refreshIntervalMinutes: data[0]?.refreshIntervalMinutes || 10,
      });
      setSelectedPortfolio((current) => {
        if (data.length === 0) return null;
        return (
          data.find((portfolio) => portfolio._id === current?._id) || data[0]
        );
      });
    } catch (err) {
      if (err.response?.status !== 401) {
        setPortfolioError("Could not load portfolio data.");
      }
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const loadWatchlist = async () => {
    try {
      setLoadingWatchlist(true);
      setWatchlistError("");
      const res = await getWatchlist();
      setWatchlistItems(res.stocks || []);
      setWatchlistSnapshotMeta({
        pricesUpdatedAt: res.pricesUpdatedAt || null,
        priceSource: res.priceSource || "cse",
        priceStale: Boolean(res.priceStale),
        refreshIntervalMinutes: res.refreshIntervalMinutes || 10,
      });
    } catch {
      setWatchlistError("Could not load watchlist.");
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const handleCreatePortfolio = async () => {
    try {
      const res = await createPortfolio("My Portfolio");
      await loadPortfolios();
      if (res.data?._id) {
        setSelectedPortfolio(
          (current) =>
            portfolios.find((portfolio) => portfolio._id === current?._id) ||
            current,
        );
      }
    } catch {
      setPortfolioError("Could not create portfolio.");
    }
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    if (!selectedPortfolio) return;
    setAddingHolding(true);
    try {
      await addHolding(selectedPortfolio._id, {
        companyTicker: newHolding.companyTicker,
        companyName: newHolding.companyName || newHolding.companyTicker,
        shares: Number(newHolding.shares),
        averageCost: Number(newHolding.averageCost),
      });
      setNewHolding({
        companyTicker: "",
        companyName: "",
        shares: "",
        averageCost: "",
      });
      await loadPortfolios();
    } catch (err) {
      setPortfolioError(
        err.response?.data?.message || "Could not add holding.",
      );
    } finally {
      setAddingHolding(false);
    }
  };

  const handleRemoveHolding = async (ticker) => {
    if (!selectedPortfolio) return;
    try {
      await removeHolding(selectedPortfolio._id, ticker);
      await loadPortfolios();
    } catch {
      setPortfolioError("Could not remove holding.");
    }
  };

  const handleAddToWatchlist = async (e) => {
    e.preventDefault();
    if (!watchlistInput.trim()) return;
    try {
      setWatchlistError("");
      await addToWatchlist(watchlistInput.trim().toUpperCase());
      setWatchlistInput("");
      await loadWatchlist();
    } catch (err) {
      setWatchlistError(
        err.response?.data?.message || "Could not add to watchlist.",
      );
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      await loadWatchlist();
    } catch {
      setWatchlistError("Could not remove from watchlist.");
    }
  };

  const activeHoldings = selectedPortfolio?.holdings || [];
  const totalValue = selectedPortfolio?.totalValue || 0;
  const totalInvestment = selectedPortfolio?.totalInvestment || 0;
  const totalGainLoss = selectedPortfolio?.totalGainLoss || 0;
  const totalGainLossPercent = selectedPortfolio?.totalGainLossPercent || 0;
  const valueHistory = selectedPortfolio?.valueHistory || [];

  const {
    labels: growthLabels,
    values: growthValues,
    investments: growthInvestments,
  } = useMemo(() => buildGrowthHistory(valueHistory), [valueHistory]);
  const hasTrackedHistory = growthValues.length > 0;
  const hasMultiPointHistory = growthValues.length > 1;

  const growthChartData = {
    labels: growthLabels,
    datasets: [
      {
        label: "Portfolio Value (LKR)",
        data: growthValues,
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96, 165, 250, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#60a5fa",
        pointHoverRadius: 6,
      },
      {
        label: "Total Investment (LKR)",
        data: growthInvestments,
        borderColor: "rgba(148, 163, 184, 0.6)",
        borderDash: [6, 6],
        fill: false,
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const growthChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `LKR ${ctx.parsed.y.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: "Portfolio Value (LKR)", color: "#94a3b8" },
        ticks: {
          color: "#94a3b8",
          callback: (v) => `LKR ${Number(v).toLocaleString("en-LK")}`,
        },
        grid: { color: "rgba(51, 65, 85, 0.5)" },
      },
      x: { 
        title: { display: true, text: "Snapshot Time", color: "#94a3b8" },
        ticks: { color: "#94a3b8" },
        grid: { display: false }
      },
    },
  };

  // ── Holdings Allocation (bar chart) ──────────────────────────────────────────
  const holdingsChartData = {
    labels: activeHoldings.map((h) => h.companyTicker),
    datasets: [
      {
        label: "Current Value (LKR)",
        data: activeHoldings.map((h) => h.currentValue || 0),
        backgroundColor: [
          "rgba(30, 58, 138, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
        borderRadius: 6,
      },
    ],
  };

  const holdingsChartOptions = {
    responsive: true,
    plugins: { 
      legend: { 
        position: "top",
        labels: { color: "#94a3b8" }
      } 
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: "Value (LKR)", color: "#94a3b8" },
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(51, 65, 85, 0.5)" }
      },
      x: { 
        title: { display: true, text: "Stock", color: "#94a3b8" },
        ticks: { color: "#94a3b8" },
        grid: { display: false }
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 animate-fadeIn">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="premium-gradient p-12 rounded-3xl text-center mb-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">Portfolio &amp; Watchlist</h1>
          <p className="text-lg text-blue-100/90 font-medium max-w-2xl mx-auto">
            Track your CSE investments with official Colombo Stock Exchange
            snapshots refreshed every 10 minutes
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-6 py-4 text-sm text-blue-200/80 backdrop-blur-md flex items-center gap-3 animate-slideUp">
          <span className="text-xl">ℹ️</span>
          <div>
            <div className="font-bold text-blue-400">
              Portfolio prices use the latest CSE snapshot.
            </div>
            <div className="mt-0.5 opacity-70">
              Last update:{" "}
              {formatSnapshotTime(portfolioSnapshotMeta.pricesUpdatedAt)}
              {portfolioSnapshotMeta.priceStale
                ? " • showing the latest stored official prices because the live feed is temporarily unavailable"
                : ""}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {selectedPortfolio && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Value",
                value: `LKR ${totalValue.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
                icon: "💰"
              },
              {
                label: "Total Investment",
                value: `LKR ${totalInvestment.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
                icon: "📈"
              },
              {
                label: "Gain / Loss",
                value: `LKR ${totalGainLoss.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`,
                color: totalGainLoss >= 0 ? "text-green-400" : "text-red-400",
                icon: "⚖️"
              },
              {
                label: "Return %",
                value: `${totalGainLossPercent >= 0 ? "+" : ""}${totalGainLossPercent}%`,
                color:
                  totalGainLossPercent >= 0 ? "text-green-400" : "text-red-400",
                icon: "📊"
              },
            ].map((card, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl text-center hover:glow-blue transition-all duration-300 animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-2xl mb-2">{card.icon}</div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                <p
                  className={`text-xl font-black ${card.color || "text-blue-400"} text-glow`}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Growth Over Time Chart */}
        {activeHoldings.length > 0 && (
          <div className="card mb-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
               <span className="text-xl">📈</span> Portfolio Growth Over Time
            </h2>
            <p className="text-sm text-slate-400 mb-8">
              Real portfolio tracking from saved 10-minute CSE snapshots
            </p>
            <div className="p-4 bg-slate-900/30 rounded-2xl border border-white/5">
              {hasTrackedHistory ? (
                <>
                  <Line data={growthChartData} options={growthChartOptions} />
                  <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
                    Tracking started:{" "}
                    <span className="text-slate-400">{formatSnapshotTime(selectedPortfolio?.trackedSince)}</span>
                    {!hasMultiPointHistory
                      ? " • Waiting for the next 10-minute snapshot to draw a trend"
                      : ""}
                  </p>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/20 px-8 py-12 text-center">
                  <p className="text-slate-400 font-medium">Real portfolio tracking has started.</p>
                  <p className="text-xs text-slate-500 mt-2">The first CSE snapshot will appear here shortly, and the chart will build every 10 minutes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio Section */}
        <div className="card mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-xl">💼</span> My Portfolio
            </h2>
            {portfolios.length === 0 && !loadingPortfolio && (
              <button
                onClick={handleCreatePortfolio}
                className="btn btn-primary shadow-lg shadow-blue-600/20"
              >
                + Create Portfolio
              </button>
            )}
          </div>

          {portfolioError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4 text-red-700 text-sm">
              {portfolioError}
            </div>
          )}

          {loadingPortfolio ? (
            <p className="text-gray-500 text-center py-8">
              Loading portfolio...
            </p>
          ) : (
            <>
              {selectedPortfolio && (
                <form
                  onSubmit={handleAddHolding}
                  className="grid md:grid-cols-5 gap-4 mb-6"
                >
                  <input
                    type="text"
                    placeholder="Ticker (e.g. JKH.N0000)"
                    className="input"
                    value={newHolding.companyTicker}
                    onChange={(e) =>
                      setNewHolding({
                        ...newHolding,
                        companyTicker: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="input"
                    value={newHolding.companyName}
                    onChange={(e) =>
                      setNewHolding({
                        ...newHolding,
                        companyName: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Shares"
                    className="input"
                    value={newHolding.shares}
                    onChange={(e) =>
                      setNewHolding({ ...newHolding, shares: e.target.value })
                    }
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Buy Price (LKR)"
                    className="input"
                    value={newHolding.averageCost}
                    onChange={(e) =>
                      setNewHolding({
                        ...newHolding,
                        averageCost: e.target.value,
                      })
                    }
                    required
                    min="0.01"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary bg-blue-600 hover:bg-blue-500"
                    disabled={addingHolding}
                  >
                    {addingHolding ? "Adding..." : "Add to Portfolio"}
                  </button>
                </form>
              )}

              {activeHoldings.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-dashed border-slate-700">
                  <p className="text-slate-500 font-medium">
                    {selectedPortfolio
                      ? "No holdings yet. Add your first stock above."
                      : "Create a portfolio to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80">
                        {[
                          "Company",
                          "Shares",
                          "Avg. Cost",
                          "Current Price",
                          "Value",
                          "Gain/Loss (%)",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-500 border-b border-white/5"
                          >
                            {h}
                          </th>
                        ))}
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-500 border-b border-white/5">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeHoldings.map((item) => (
                        <tr
                          key={item.companyTicker}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm font-bold text-slate-200">
                            {item.companyTicker}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">{item.shares}</td>
                          <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                            {item.averageCost?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="font-black text-blue-400">
                              {item.currentPrice != null ? (
                                item.currentPrice.toFixed(2)
                              ) : (
                                <span className="text-slate-600">Unavailable</span>
                              )}
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-tighter text-slate-600 mt-0.5">
                              {item.hasOfficialPrice
                                ? "CSE snapshot"
                                : "Estimated"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-slate-200 font-mono">
                            {item.currentValue?.toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 text-sm`}>
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${(item.gainLossPercent || 0) >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                              {(item.gainLossPercent || 0) >= 0 ? "+" : ""}
                              {item.gainLossPercent?.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() =>
                                handleRemoveHolding(item.companyTicker)
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Holdings Allocation Chart */}
        {activeHoldings.length > 0 && (
          <div className="card mb-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-xl">📊</span> Holdings Allocation
            </h2>
            <div className="p-4 bg-slate-900/30 rounded-2xl border border-white/5">
              <Bar data={holdingsChartData} options={holdingsChartOptions} />
            </div>
          </div>
        )}

        {/* Watchlist Section */}
        <div className="card mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-xl">⭐</span> Watchlist
            </h2>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5">
              Last update: {formatSnapshotTime(watchlistSnapshotMeta.pricesUpdatedAt)}
              {watchlistSnapshotMeta.priceStale ? " • STALE" : ""}
            </div>
          </div>

          <form onSubmit={handleAddToWatchlist} className="flex gap-4 mb-6">
            <input
              type="text"
              value={watchlistInput}
              onChange={(e) => setWatchlistInput(e.target.value)}
              placeholder="Add ticker to watchlist (e.g. HNB.N0000)"
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary bg-blue-600 hover:bg-blue-500">
              Add to Watchlist
            </button>
          </form>

          {watchlistError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4 text-red-700 text-sm">
              {watchlistError}
            </div>
          )}

          {loadingWatchlist ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading watchlist...</p>
            </div>
          ) : watchlistItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-dashed border-slate-700">
              <p className="text-slate-500 font-medium whitespace-pre-wrap">Your watchlist is empty.{"\n"}Add stocks to monitor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80">
                    {[
                      "Company",
                      "Current Price",
                      "Change (%)",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-500 border-b border-white/5"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-500 border-b border-white/5">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {watchlistItems.map((item) => (
                    <tr
                      key={item.symbol}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-slate-200">
                        {item.symbol}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-black text-blue-400">
                          {item.currentPrice != null ? (
                            item.currentPrice.toFixed(2)
                          ) : (
                            <span className="text-slate-600">Unavailable</span>
                          )}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-tighter text-slate-600 mt-0.5">
                          {item.priceSource === "cse"
                            ? "CSE snapshot"
                            : item.priceSource === "db-cache"
                              ? "Cached"
                              : "No quote"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${item.changePercentage >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {item.changePercentage != null
                            ? `${item.changePercentage >= 0 ? "+" : ""}${Number(item.changePercentage).toFixed(2)}%`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveFromWatchlist(item.symbol)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
