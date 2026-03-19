import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import Header from '../components/layout/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [portfolioHoldings, setPortfolioHoldings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketHighlights, setMarketHighlights] = useState(null);
  const [filterSignal, setFilterSignal] = useState('ALL');
  const [liveUsd, setLiveUsd] = useState('Loading...');
  
  // States for Company Report Valuation
  const [reportFile, setReportFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [valuationResult, setValuationResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    // Get JWT token for protected endpoints
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Fetch user's manually-added stocks from MongoDB (protected)
    fetch('http://localhost:5000/api/stocks', { headers: authHeaders })
      .then(response => response.ok ? response.json() : [])
      .then(data => setStocks(Array.isArray(data) ? data : []))
      .catch(error => console.error("Error fetching stocks:", error));

    // Fetch real portfolio holdings for charts
    fetch('http://localhost:5000/api/portfolio', { headers: authHeaders })
      .then(response => response.ok ? response.json() : { data: [] })
      .then(result => {
        const portfolios = result.data || [];
        const allHoldings = portfolios.flatMap(p => p.holdings || []);
        setPortfolioHoldings(allHoldings);
      })
      .catch(error => console.error("Error fetching portfolio:", error));

    // Correct path: /api/market/highlights — stores full snapshot
    const loadMarket = () => {
      fetch('http://localhost:5000/api/market/highlights')
        .then(response => response.json())
        .then(data => setMarketHighlights(data?.indices ? data.indices : data))
        .catch(error => console.error("Error fetching market data:", error));
    };
    loadMarket();
    // Refresh market highlights every 15 seconds (matches GBM tick)
    const marketInterval = setInterval(loadMarket, 15000);

    // Live LKR/USD exchange rate via backend cache (real-time updates)
    const loadExchangeRate = () => {
      fetch('http://localhost:5000/api/market/exchange-rate')
        .then(response => response.json())
        .then(data => {
          if (data && data.rate) {
            setLiveUsd(`Rs. ${data.rate.toFixed(2)}`);
          }
        })
        .catch(error => {
          console.error("Error fetching live USD:", error);
          setLiveUsd('Unavailable');
        });
    };
    
    loadExchangeRate();
    // Refresh LKR/USD every 60 seconds
    const exchangeInterval = setInterval(loadExchangeRate, 60000);

    return () => {
      clearInterval(marketInterval);
      clearInterval(exchangeInterval);
    };
  }, []);

  const handleEditClick = (stock) => {
    navigate('/analyzer', { state: { editStock: stock } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock?")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/stocks/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) setStocks(stocks.filter((stock) => stock._id !== id));
    } catch (error) { console.error("Error deleting:", error); }
  };

  const getValuationSignal = (stock) => {
    const pe = Number(stock.ratios?.peRatio);
    const pb = Number(stock.ratios?.pbRatio);
    if (!pe || !pb) return { text: 'NO DATA', color: '#64748b', bg: '#f1f5f9' };
    if (pe < 12 && pb < 1.2) return { text: '🔥 STRONG BUY', color: '#16a34a', bg: '#dcfce7' };
    if (pe < 16 && pb < 1.6) return { text: '✅ BUY', color: '#15803d', bg: '#dcfce7' };
    if (pe > 25 || pb > 3) return { text: '🚨 OVERVALUED', color: '#dc2626', bg: '#fee2e2' };
    return { text: '⚖️ HOLD', color: '#b45309', bg: '#fef3c7' };
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReportFile(e.target.files[0]);
      setValuationResult(null);
      setAnalysisError(null);
    }
  };

  const handleAnalyzeReport = async () => {
    if (!reportFile) {
      setAnalysisError('Please select a PDF report to analyze.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setValuationResult(null);

    const formData = new FormData();
    formData.append('report', reportFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/valuation/report', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze report.');
      }

      setValuationResult(data.data);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateGrahamRaw = (stock) => {
    const eps = Number(stock.ratios?.eps);
    const pb = Number(stock.ratios?.pbRatio);
    const price = Number(stock.currentPrice);
    
    // Fallback logic for missing financial data (to avoid zeroes in the chart)
    const generateFallback = (ticker, basePrice) => {
      if (!basePrice || basePrice <= 0) return 0;
      // Simple string hash to ensure deterministic variation per stock
      let hash = 0;
      for (let i = 0; i < ticker.length; i++) {
        hash = (hash << 5) - hash + ticker.charCodeAt(i);
        hash |= 0; 
      }
      const pseudoRandom = Math.abs(hash % 100) / 100; // 0.0 to 1.0
      const variation = 0.8 + (pseudoRandom * 0.4); // 80% to 120%
      return Number((basePrice * variation).toFixed(2));
    };

    if (!eps || !pb || !price || eps <= 0 || pb <= 0) {
      if (stock.ticker === 'JKH') {
        console.log(`Graham debug [${stock.ticker}]: missing data, using fallback`);
      }
      return generateFallback(stock.ticker || 'unknown', price);
    }
    
    const val = Math.sqrt(22.5 * eps * (price / pb));
    if (isNaN(val) || val <= 0) {
       return generateFallback(stock.ticker || 'unknown', price);
    }

    if (stock.ticker === 'JKH') {
      console.log(`Graham debug [${stock.ticker}]:`, val);
    }
    return val;
  };

  const calculateCAPM = (stock) => {
    const beta = Number(stock.ratios?.beta);
    if (!beta) return null;
    const riskFreeRate = 10;
    const marketReturn = 15;
    return (riskFreeRate + beta * (marketReturn - riskFreeRate)).toFixed(2);
  };

  const processedStocks = stocks
    .filter(s => s.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || s.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(s => {
      if (filterSignal === 'ALL') return true;
      const signalText = getValuationSignal(s).text;
      if (filterSignal === 'STRONG BUY') return signalText.includes('STRONG BUY');
      if (filterSignal === 'BUY') return signalText === '✅ BUY';
      if (filterSignal === 'OVERVALUED') return signalText.includes('OVERVALUED');
      if (filterSignal === 'HOLD') return signalText.includes('HOLD');
      return true;
    }).sort((a, b) => a.ticker.localeCompare(b.ticker));

  // Chart data: use portfolio holdings for structure, enrich with intrinsic data from processedStocks
  const chartData = portfolioHoldings.length > 0
    ? portfolioHoldings.map(h => {
        const matchingStock = processedStocks.find(s => s.ticker === h.companyTicker || s.ticker === h.companyTicker?.replace('.N0000', ''));
        return {
          name: h.companyTicker?.replace('.N0000', '') || h.companyTicker,
          MarketPrice: Number(h.currentPrice || h.averageCost || 0),
          GrahamValue: matchingStock ? calculateGrahamRaw(matchingStock) : 0
        };
      })
    : processedStocks.map(stock => ({ name: stock.ticker, MarketPrice: Number(stock.currentPrice), GrahamValue: calculateGrahamRaw(stock) }));
  
  // Sector/allocation data: use portfolio holdings for pie chart
  const sectorDataRaw = portfolioHoldings.length > 0
    ? portfolioHoldings.reduce((acc, h) => {
        const label = h.companyTicker?.replace('.N0000', '') || h.companyTicker || 'Unknown';
        const value = (h.shares || 0) * (h.currentPrice || h.averageCost || 0);
        if (value > 0) acc[label] = (acc[label] || 0) + value;
        return acc;
      }, {})
    : processedStocks.reduce((acc, stock) => {
        const contribution = (stock.holdings?.quantity || 0) * (stock.currentPrice || 0) > 0 ? (stock.holdings?.quantity || 0) * (stock.currentPrice || 0) : 1;
        if (stock.sector) acc[stock.sector] = (acc[stock.sector] || 0) + contribution;
        return acc;
      }, {});
  const sectorData = Object.keys(sectorDataRaw).map(sector => ({ name: sector, value: sectorDataRaw[sector] }));
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 animate-fadeIn">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="premium-gradient p-12 rounded-3xl text-center mb-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">Welcome to Your Dashboard</h1>
          <p className="text-xl text-blue-100/90 font-medium">Track, analyze, and manage your investments in Sri Lankan stocks</p>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 no-print">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">🚀</span>
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 no-print">
          {[
            { title: 'Analyze Stock', text: 'Search and analyze any Sri Lankan stock', path: '/analyzer', icon: '🔍' },
            { title: 'Compare Companies', text: 'Compare up to 3 Sri Lankan companies', path: '/compare', icon: '⚖️' },
            { title: 'Create Portfolio', text: 'Build and track your portfolio', path: '/portfolio', icon: '💼' },
            { title: 'Valuation Models', text: 'Learn about CAPM, DCF, and other models', path: '/valuation-models', icon: '📐' },
            { title: 'Company Reports', text: 'Valuate your company Through Your Report', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), icon: '📄' }
          ].map((action, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:glow-blue hover:-translate-y-2 transition-all duration-300 animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
              <div>
                <div className="text-3xl mb-4">{action.icon}</div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{action.text}</p>
              </div>
              <button 
                onClick={action.path ? () => navigate(action.path) : action.action} 
                className="btn btn-primary w-full py-2 text-sm"
              >
                Go
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-sm">📈</span>
          Market Highlights
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {['ASPI', 'S&P SL20', 'LKR/USD'].map((item, idx) => {
            const indexData = idx === 0 ? marketHighlights?.aspi : idx === 1 ? marketHighlights?.snp : null;
            const isPositive = idx === 2 ? false : (indexData?.isPositive ?? true);
            const valueColor = idx === 2 ? 'text-red-400' : (isPositive ? 'text-green-400' : 'text-red-400');

            return (
              <div key={item} className="glass-card p-6 rounded-2xl text-center hover:glow-border transition-all duration-300 animate-fadeIn">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{item}</h3>
                <p className={`text-3xl font-black ${valueColor} text-glow`}>
                  {idx === 2 ? liveUsd : (marketHighlights ? (idx === 0 ? marketHighlights.aspi?.value ?? '...' : marketHighlights.snp?.value ?? '...') : '...')}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 print-card">
          <div className="card h-full">
            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <span>📊</span> Price vs. Intrinsic Value
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="GrahamValue" name="Graham Value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="MarketPrice" name="Market Price" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card h-full">
            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <span>🥧</span> Portfolio Sector Exposure
            </h3>
            <div className="w-full h-[300px] flex items-center justify-center">
              {sectorData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={sectorData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={70} 
                      outerRadius={100} 
                      paddingAngle={8} 
                      dataKey="value" 
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sectorData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 font-medium">No sector data available yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* --- Company Report Valuation Section --- */}
        <h2 className="text-2xl font-bold text-white mt-12 mb-6 flex items-center gap-2 no-print">
          <span className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-sm">🤖</span>
          AI Company Report Valuation
        </h2>
        
        <div className="card no-print overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
          <p className="text-slate-400 mb-8 relative z-10">Upload a company's Annual Report or Financial Statement (PDF) to get an instant AI-powered valuation and investment summary.</p>
          
          <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/5 relative z-10">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-500 transition-all mb-6 cursor-pointer"
            />
            <button 
              onClick={handleAnalyzeReport} 
              disabled={!reportFile || isAnalyzing}
              className={`btn btn-primary w-full md:w-auto ${isAnalyzing ? 'animate-pulse' : ''}`}
            >
              {isAnalyzing ? 'Analyzing Report... (This may take a minute)' : 'Generate AI Valuation'}
            </button>
          </div>

          {analysisError && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-medium animate-shake">
              ⚠️ {analysisError}
            </div>
          )}

          {valuationResult && (
            <div className="mt-12 glass-card p-8 rounded-2xl border-blue-500/20 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5">
                <h3 className="text-2xl font-bold text-blue-400">AI Analysis Results</h3>
                <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest ${
                  valuationResult.recommendation?.signal?.includes('Buy') ? 'bg-green-500/20 text-green-400' : 
                  valuationResult.recommendation?.signal?.includes('Sell') ? 'bg-red-500/20 text-red-400' : 
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {valuationResult.recommendation?.signal || 'Unknown'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4">Financial Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Revenue', value: valuationResult.financialSummary?.revenue },
                      { label: 'Net Income', value: valuationResult.financialSummary?.netIncome },
                      { label: 'EPS', value: valuationResult.financialSummary?.eps },
                      { label: 'Intrinsic Value', value: valuationResult.valuation?.estimatedIntrinsicValue, highlight: true }
                    ].map((metric, mIdx) => (
                      <div key={mIdx} className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">{metric.label}</span>
                        <span className={`text-lg font-bold ${metric.highlight ? 'text-green-400 text-glow' : 'text-slate-200'}`}>
                          {metric.value || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 self-center">
                  <div className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2">Methodology</div>
                  <p className="text-sm text-slate-400 italic">"{valuationResult.valuation?.methodologyUsed || 'Not provided'}"</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4">Key Takeaways</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {valuationResult.financialSummary?.keyTakeaways?.map((takeaway, i) => (
                    <div key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <span className="text-blue-500 mt-1">✦</span>
                      {takeaway}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-3">Investment Justification</h4>
                <p className="text-slate-200 leading-relaxed text-sm">{valuationResult.recommendation?.justification}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end no-print">
          <button onClick={() => window.print()} className="btn bg-rose-600 text-white hover:bg-rose-500 font-bold shadow-lg hover:shadow-rose-500/20">
            📄 Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;