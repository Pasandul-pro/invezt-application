import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [symbol, setSymbol] = useState('JKH.N0000');
  const [stockData, setStockData] = useState(null);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Popular CSE stocks
  const popularStocks = [
    { symbol: 'JKH.N0000', name: 'John Keells' },
    { symbol: 'COMB.N0000', name: 'Commercial Bank' },
    { symbol: 'HNB.N0000', name: 'Hatton National' },
    { symbol: 'SAMP.N0000', name: 'Sampath Bank' },
    { symbol: 'LOLC.N0000', name: 'LOLC' },
    { symbol: 'DIAL.N0000', name: 'Dialog' },
  ];

  // Fetch stock data
  const fetchStockData = async (stockSymbol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/stocks/${stockSymbol}`);
      setStockData(response.data.data);
    } catch (err) {
      setError('Failed to fetch stock data. Make sure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch market data
  const fetchMarketData = async () => {
    try {
      const [gainersRes, losersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/market/gainers`),
        axios.get(`${API_BASE_URL}/market/losers`)
      ]);
      
      setGainers(gainersRes.data.data || []);
      setLosers(losersRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch market data', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStockData(symbol);
    fetchMarketData();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStockData(symbol);
      fetchMarketData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      fetchStockData(symbol.toUpperCase());
    }
  };

  const formatCurrency = (num) => {
    if (!num) return 'N/A';
    return `LKR ${num.toFixed(2)}`;
  };

  const formatLargeNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1e9) return `LKR ${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `LKR ${(num / 1e6).toFixed(2)}M`;
    return `LKR ${num.toLocaleString()}`;
  };

  return (
    <div className="App">
      <header className="demo-header">
        <h1>📈 CSE Real-time Stock API Demo</h1>
        <p>Colombo Stock Exchange Live Data</p>
      </header>

      <main className="demo-container">
        {/* Search Section */}
        <div className="demo-card">
          <form onSubmit={handleSearch} className="demo-search-form">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter symbol (e.g., JKH.N0000)"
              className="demo-search-input"
            />
            <button type="submit" className="demo-search-btn">
              Get Stock Data
            </button>
          </form>

          <div className="demo-tags">
            {popularStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => {
                  setSymbol(stock.symbol);
                  fetchStockData(stock.symbol);
                }}
                className="demo-tag"
              >
                {stock.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="demo-error">{error}</div>}

        {/* Loading */}
        {loading && <div className="demo-loading">Loading...</div>}

        {/* Stock Data Display */}
        {stockData && !loading && (
          <div className="demo-stock-card">
            <div className="demo-stock-header">
              <div>
                <h2>{stockData.symbol}</h2>
                <p className="demo-company-name">{stockData.name}</p>
              </div>
              <div className="demo-price-container">
                <div className="demo-current-price">
                  {formatCurrency(stockData.price)}
                </div>
                <div className={`demo-price-change ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
                  {stockData.change >= 0 ? '+' : ''}{stockData.change?.toFixed(2)} 
                  ({stockData.changePercentage?.toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="demo-stats-grid">
              <div className="demo-stat-item">
                <label>Market Cap</label>
                <span>{formatLargeNumber(stockData.marketCap)}</span>
              </div>
              <div className="demo-stat-item">
                <label>Volume</label>
                <span>{stockData.volume?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="demo-stat-item">
                <label>Day Range</label>
                <span>{formatCurrency(stockData.low)} - {formatCurrency(stockData.high)}</span>
              </div>
              <div className="demo-stat-item">
                <label>Open</label>
                <span>{formatCurrency(stockData.open)}</span>
              </div>
              <div className="demo-stat-item">
                <label>Beta</label>
                <span>{stockData.beta?.toFixed(3) || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Market Movers Section */}
        <div className="demo-market-movers">
          <h3>Market Movers</h3>
          
          <div className="demo-movers-grid">
            {/* Gainers */}
            <div className="demo-movers-column">
              <h4 className="demo-gainers-title">🚀 Top Gainers</h4>
              <div className="demo-movers-list">
                {gainers.slice(0, 5).map((stock, index) => (
                  <div key={index} className="demo-mover-item">
                    <span className="demo-mover-symbol">{stock.symbol}</span>
                    <span className="demo-mover-price">LKR {stock.lastTradedPrice}</span>
                    <span className="demo-mover-change positive">
                      +{stock.changePercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div className="demo-movers-column">
              <h4 className="demo-losers-title">📉 Top Losers</h4>
              <div className="demo-movers-list">
                {losers.slice(0, 5).map((stock, index) => (
                  <div key={index} className="demo-mover-item">
                    <span className="demo-mover-symbol">{stock.symbol}</span>
                    <span className="demo-mover-price">LKR {stock.lastTradedPrice}</span>
                    <span className="demo-mover-change negative">
                      {stock.changePercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="demo-api-info">
          <h4>📡 API Endpoints Used:</h4>
          <ul>
            <li><code>GET /api/stocks/:symbol</code> - Real-time stock data</li>
            <li><code>GET /api/market/gainers</code> - Top gainers</li>
            <li><code>GET /api/market/losers</code> - Top losers</li>
          </ul>
          <p className="demo-update-note">⏱️ Auto-refreshes every 30 seconds</p>
        </div>
      </main>

      <footer className="demo-footer">
        <p>Simple Demo for CSE Real-time Stock API | Backend: Node.js + Express</p>
      </footer>
    </div>
  );
}

export default App;