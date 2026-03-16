import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Market highlights state
  const [marketHighlights, setMarketHighlights] = useState(null);
  const [liveUsd, setLiveUsd] = useState('Loading...');

  useEffect(() => {
    // Fetch market highlights
    const loadMarket = () => {
      fetch('http://localhost:5000/api/market/highlights')
        .then(response => response.json())
        .then(data => setMarketHighlights(data?.indices ? data.indices : data))
        .catch(() => {});
    };
    loadMarket();
    const marketInterval = setInterval(loadMarket, 15000);

    // Live LKR/USD exchange rate
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(response => response.json())
      .then(data => {
        if (data && data.rates && data.rates.LKR) {
          setLiveUsd(`Rs. ${data.rates.LKR.toFixed(2)}`);
        }
      })
      .catch(() => setLiveUsd('Unavailable'));

    return () => clearInterval(marketInterval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const tickerItems = [
    {
      label: 'ASPI',
      value: marketHighlights?.aspi?.value ?? '...',
      isPositive: marketHighlights?.aspi?.isPositive ?? true,
    },
    {
      label: 'S&P SL20',
      value: marketHighlights?.snp?.value ?? '...',
      isPositive: marketHighlights?.snp?.isPositive ?? true,
    },
    {
      label: 'LKR/USD',
      value: liveUsd,
      isPositive: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex flex-col items-center justify-center p-4">
      {/* Market Highlights Ticker */}
      <div style={tickerStyles.wrapper}>
        <div style={tickerStyles.track}>
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} style={tickerStyles.item}>
              <span style={tickerStyles.label}>{item.label}</span>
              <span style={{
                ...tickerStyles.value,
                color: item.label === 'LKR/USD' ? '#fbbf24' : (item.isPositive ? '#4ade80' : '#f87171')
              }}>
                {item.value}
              </span>
              <span style={tickerStyles.separator}>•</span>
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Invezt</h1>
          <p className="text-gray-600 mt-2">Investing Made Simple</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mb-3" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <Link
            to="/register"
            className="btn bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white w-full block text-center"
          >
            Create Account
          </Link>

          <div className="text-center mt-6">
            <a href="#" className="text-primary hover:underline text-sm">Forgot password?</a>
          </div>
        </form>

        <div className="text-center mt-8">
          <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
};

const tickerStyles = {
  wrapper: {
    width: '100%',
    maxWidth: '600px',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    marginBottom: '24px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  track: {
    display: 'flex',
    whiteSpace: 'nowrap',
    animation: 'tickerScroll 20s linear infinite',
    padding: '12px 0',
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 20px',
    flexShrink: 0,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
  },
  value: {
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
  },
  separator: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: '10px',
    marginLeft: '14px',
  },
};

export default Login;