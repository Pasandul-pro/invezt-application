import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getPortfolios, createPortfolio, addHolding, removeHolding } from '../api/portfolioApi.js';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../api/watchlistApi.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Portfolio = () => {
  // Portfolio state
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState('');

  // New holding form
  const [newHolding, setNewHolding] = useState({ companyTicker: '', companyName: '', shares: '', averageCost: '' });
  const [addingHolding, setAddingHolding] = useState(false);

  // Watchlist state
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [watchlistInput, setWatchlistInput] = useState('');
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [watchlistError, setWatchlistError] = useState('');

  // Load portfolios on mount
  useEffect(() => {
    loadPortfolios();
    loadWatchlist();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoadingPortfolio(true);
      setPortfolioError('');
      const res = await getPortfolios();
      const data = res.data || [];
      setPortfolios(data);
      if (data.length > 0) setSelectedPortfolio(data[0]);
    } catch (err) {
      if (err.response?.status !== 401) {
        setPortfolioError('Could not load portfolio data.');
      }
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const loadWatchlist = async () => {
    try {
      setLoadingWatchlist(true);
      setWatchlistError('');
      const res = await getWatchlist();
      setWatchlistItems(res.stocks || []);
    } catch {
      setWatchlistError('Could not load watchlist.');
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const handleCreatePortfolio = async () => {
    try {
      const res = await createPortfolio('My Portfolio');
      const newPortfolio = res.data;
      setPortfolios([...portfolios, newPortfolio]);
      setSelectedPortfolio(newPortfolio);
    } catch (err) {
      setPortfolioError('Could not create portfolio.');
    }
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    if (!selectedPortfolio) return;
    setAddingHolding(true);
    try {
      const res = await addHolding(selectedPortfolio._id, {
        companyTicker: newHolding.companyTicker,
        companyName: newHolding.companyName || newHolding.companyTicker,
        shares: Number(newHolding.shares),
        averageCost: Number(newHolding.averageCost)
      });
      setSelectedPortfolio(res.data);
      setPortfolios(portfolios.map(p => p._id === res.data._id ? res.data : p));
      setNewHolding({ companyTicker: '', companyName: '', shares: '', averageCost: '' });
    } catch (err) {
      setPortfolioError(err.response?.data?.message || 'Could not add holding.');
    } finally {
      setAddingHolding(false);
    }
  };

  const handleRemoveHolding = async (ticker) => {
    if (!selectedPortfolio) return;
    try {
      const res = await removeHolding(selectedPortfolio._id, ticker);
      setSelectedPortfolio(res.data);
      setPortfolios(portfolios.map(p => p._id === res.data._id ? res.data : p));
    } catch (err) {
      setPortfolioError('Could not remove holding.');
    }
  };

  const handleAddToWatchlist = async (e) => {
    e.preventDefault();
    if (!watchlistInput.trim()) return;
    try {
      setWatchlistError('');
      await addToWatchlist(watchlistInput.trim().toUpperCase());
      setWatchlistInput('');
      loadWatchlist();
    } catch (err) {
      setWatchlistError(err.response?.data?.message || 'Could not add to watchlist.');
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      setWatchlistItems(watchlistItems.filter(s => s.symbol !== symbol));
    } catch {
      setWatchlistError('Could not remove from watchlist.');
    }
  };

  // Build chart from selected portfolio holdings
  const activeHoldings = selectedPortfolio?.holdings || [];
  const totalValue = selectedPortfolio?.totalValue || 0;
  const totalInvestment = selectedPortfolio?.totalInvestment || 0;
  const totalGainLoss = selectedPortfolio?.totalGainLoss || 0;
  const totalGainLossPercent = selectedPortfolio?.totalGainLossPercent || 0;

  const chartData = {
    labels: activeHoldings.map(h => h.companyTicker),
    datasets: [{
      label: 'Current Value (LKR)',
      data: activeHoldings.map(h => h.currentValue || 0),
      borderColor: '#1e3a8a',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: false, title: { display: true, text: 'Value (LKR)' } },
      x: { title: { display: true, text: 'Stock' } }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-12 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Portfolio & Watchlist</h1>
          <p className="text-lg opacity-90">Track your CSE investments and monitor stocks in real time</p>
        </div>

        {/* Summary Cards */}
        {selectedPortfolio && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Value', value: `LKR ${totalValue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}` },
              { label: 'Total Investment', value: `LKR ${totalInvestment.toLocaleString('en-LK', { minimumFractionDigits: 2 })}` },
              { label: 'Gain / Loss', value: `LKR ${totalGainLoss.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`, color: totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600' },
              { label: 'Return %', value: `${totalGainLossPercent >= 0 ? '+' : ''}${totalGainLossPercent}%`, color: totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600' }
            ].map((card, i) => (
              <div key={i} className="card text-center">
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color || 'text-primary'}`}>{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">My Portfolio</h2>
            {portfolios.length === 0 && !loadingPortfolio && (
              <button onClick={handleCreatePortfolio} className="btn btn-primary">
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
            <p className="text-gray-500 text-center py-8">Loading portfolio...</p>
          ) : (
            <>
              {/* Add Holding Form */}
              {selectedPortfolio && (
                <form onSubmit={handleAddHolding} className="grid md:grid-cols-5 gap-4 mb-6">
                  <input type="text" placeholder="Ticker (e.g. JKH.N0000)" className="input" value={newHolding.companyTicker} onChange={e => setNewHolding({ ...newHolding, companyTicker: e.target.value })} required />
                  <input type="text" placeholder="Company Name" className="input" value={newHolding.companyName} onChange={e => setNewHolding({ ...newHolding, companyName: e.target.value })} />
                  <input type="number" placeholder="Shares" className="input" value={newHolding.shares} onChange={e => setNewHolding({ ...newHolding, shares: e.target.value })} required min="1" />
                  <input type="number" step="0.01" placeholder="Buy Price (LKR)" className="input" value={newHolding.averageCost} onChange={e => setNewHolding({ ...newHolding, averageCost: e.target.value })} required min="0.01" />
                  <button type="submit" className="btn btn-primary" disabled={addingHolding}>
                    {addingHolding ? 'Adding...' : 'Add to Portfolio'}
                  </button>
                </form>
              )}

              {/* Holdings Table */}
              {activeHoldings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {selectedPortfolio ? 'No holdings yet. Add your first stock above.' : 'Create a portfolio to get started.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {['Company', 'Shares', 'Avg. Cost (LKR)', 'Current Price (LKR)', 'Value (LKR)', 'Gain/Loss (%)'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-primary">{h}</th>
                        ))}
                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeHoldings.map((item) => (
                        <tr key={item.companyTicker} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{item.companyTicker}</td>
                          <td className="px-4 py-3 text-sm">{item.shares}</td>
                          <td className="px-4 py-3 text-sm">{item.averageCost?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">
                            {item.currentPrice != null ? item.currentPrice.toFixed(2) : <span className="text-gray-400 text-xs">N/A</span>}
                          </td>
                          <td className="px-4 py-3 text-sm">{item.currentValue?.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-sm font-semibold ${(item.gainLossPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(item.gainLossPercent || 0) >= 0 ? '+' : ''}{item.gainLossPercent?.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button onClick={() => handleRemoveHolding(item.companyTicker)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs">Remove</button>
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

        {/* Portfolio Chart */}
        {activeHoldings.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Holdings Value by Stock</h2>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Watchlist Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Watchlist</h2>

          <form onSubmit={handleAddToWatchlist} className="flex gap-4 mb-6">
            <input
              type="text"
              value={watchlistInput}
              onChange={e => setWatchlistInput(e.target.value)}
              placeholder="Add ticker to watchlist (e.g. HNB.N0000)"
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary">Add to Watchlist</button>
          </form>

          {watchlistError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4 text-red-700 text-sm">
              {watchlistError}
            </div>
          )}

          {loadingWatchlist ? (
            <p className="text-gray-500 text-center py-4">Loading watchlist...</p>
          ) : watchlistItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your watchlist is empty. Add stocks to monitor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Company</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Current Price (LKR)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Change (%)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistItems.map((item) => (
                    <tr key={item.symbol} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{item.symbol}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.currentPrice != null ? item.currentPrice.toFixed(2) : <span className="text-gray-400 text-xs">Market closed</span>}
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold ${(item.changePercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.changePercentage != null ? `${item.changePercentage >= 0 ? '+' : ''}${Number(item.changePercentage).toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button onClick={() => handleRemoveFromWatchlist(item.symbol)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs">Remove</button>
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