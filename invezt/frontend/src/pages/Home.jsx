import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, PieChart, BookOpen } from 'lucide-react';

const FEATURED_SYMBOLS = ['JKH.N0000', 'COMB.N0000', 'HNB.N0000', 'DIAL.N0000', 'HAYL.N0000', 'LOLC.N0000'];

const Home = () => {
  const [featuredStocks, setFeaturedStocks] = useState([
    { symbol: 'JKH.N0000',  name: 'John Keells Holdings (JKH)',  sector: 'Diversified Holdings',       price: '...', change: '...', positive: true },
    { symbol: 'COMB.N0000', name: 'Commercial Bank (COMB)',       sector: 'Banking & Financial Services', price: '...', change: '...', positive: true },
    { symbol: 'HNB.N0000',  name: 'Hatton National Bank (HNB)',  sector: 'Banking & Financial Services', price: '...', change: '...', positive: true },
    { symbol: 'DIAL.N0000', name: 'Dialog Axiata (DIAL)',         sector: 'Telecommunications',           price: '...', change: '...', positive: false },
    { symbol: 'HAYL.N0000', name: 'Hayleys PLC (HAYL)',           sector: 'Diversified Holdings',         price: '...', change: '...', positive: true },
    { symbol: 'LOLC.N0000', name: 'LOLC Holdings (LOLC)',         sector: 'Financial Services',           price: '...', change: '...', positive: true },
  ]);

  const [marketData, setMarketData] = useState({ aspi: '...', snp: '...', lkrUsd: '...' });

  useEffect(() => {
    // Fetch market snapshot for ASPI / SNP SL20
    fetch('http://localhost:5000/api/market/highlights')
      .then(r => r.json())
      .then(data => {
        if (data?.indices) {
          setMarketData(prev => ({
            ...prev,
            aspi: data.indices.aspi?.value ?? prev.aspi,
            snp:  data.indices.snp?.value  ?? prev.snp,
          }));
        }
      })
      .catch(() => {});

    // Live LKR/USD exchange rate via backend cache (real-time updates)
    const loadExchangeRate = () => {
      fetch('http://localhost:5000/api/market/exchange-rate')
        .then(r => r.json())
        .then(data => {
          if (data?.rate) {
            setMarketData(prev => ({ ...prev, lkrUsd: `Rs. ${data.rate.toFixed(2)}` }));
          }
        })
        .catch(() => {});
    };
    
    loadExchangeRate();
    const exchangeInterval = setInterval(loadExchangeRate, 60000);

    // Fetch live prices for featured stocks (uses GBM fallback if CSE down)
    FEATURED_SYMBOLS.forEach(symbol => {
      fetch(`http://localhost:5000/api/stocks/realtime/${symbol}`)
        .then(r => r.json())
        .then(info => {
          if (!info.lastTradedPrice) return;
          setFeaturedStocks(prev => prev.map(s =>
            s.symbol === symbol
              ? {
                  ...s,
                  price:    `LKR ${info.lastTradedPrice.toFixed(2)}`,
                  change:   `${info.changePercentage >= 0 ? '+' : ''}${info.changePercentage.toFixed(2)}%`,
                  positive: info.changePercentage >= 0
                }
              : s
          ));
        })
        .catch(() => {});
    });

    // Refresh prices every 15 seconds (matches GBM tick rate)
    const interval = setInterval(() => {
      FEATURED_SYMBOLS.forEach(symbol => {
        fetch(`http://localhost:5000/api/stocks/realtime/${symbol}`)
          .then(r => r.json())
          .then(info => {
            if (!info.lastTradedPrice) return;
            setFeaturedStocks(prev => prev.map(s =>
              s.symbol === symbol
                ? {
                    ...s,
                    price:    `LKR ${info.lastTradedPrice.toFixed(2)}`,
                    change:   `${info.changePercentage >= 0 ? '+' : ''}${info.changePercentage.toFixed(2)}%`,
                    positive: info.changePercentage >= 0
                  }
                : s
            ));
          })
          .catch(() => {});
      });
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(exchangeInterval);
    };
  }, []);

  const features = [
    { icon: <BarChart3 className="w-12 h-12 text-blue-400" />, title: 'Stock Analysis',        description: 'Deep dive into CSE company financials and ratios' },
    { icon: <TrendingUp className="w-12 h-12 text-blue-400" />, title: 'Company Comparison',   description: 'Compare up to 3 CSE-listed companies side by side' },
    { icon: <PieChart className="w-12 h-12 text-blue-400" />,   title: 'Portfolio Management', description: 'Build and track your CSE investment portfolio' },
    { icon: <BookOpen className="w-12 h-12 text-blue-400" />,   title: 'Watchlist',             description: 'Monitor your favorite CSE stocks' },
  ];

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <img src="/resources/Logo.png" alt="Invezt Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold">Invezt</span>
                <span className="text-xs opacity-90">Investing Made Simple</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features"   className="hover:text-blue-400 transition-colors">Features</a>
              <a href="#companies"  className="hover:text-blue-400 transition-colors">Top Companies</a>
              <a href="#about"      className="hover:text-blue-400 transition-colors">About</a>
              <Link to="/login"     className="btn btn-outline">Log In</Link>
              <Link to="/register"  className="btn btn-primary bg-blue-600 hover:bg-blue-500">Sign Up</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="pt-20"></div>

      {/* Market Overview Bar */}
      <div className="bg-[#1e293b] border-y border-slate-800 text-white py-2 px-4 text-sm flex justify-center gap-10 flex-wrap">
        <span>📈 ASPI: <strong className="text-green-400">{marketData.aspi}</strong></span>
        <span>📊 S&P SL20: <strong className="text-green-400">{marketData.snp}</strong></span>
        <span>💵 LKR/USD: <strong className="text-yellow-400">{marketData.lkrUsd}</strong></span>
      </div>

      <section
        className="relative bg-cover bg-center bg-no-repeat py-32"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('/resources/Stock.png')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl font-bold mb-6">Smart Stock Valuation for Sri Lankan Investors</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Analyze, compare, and track CSE-listed stocks using advanced valuation models and financial ratios
          </p>
          <Link to="/login" className="btn btn-primary text-lg">Get Started with CSE Analysis</Link>
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Key Features for CSE Investors</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center group">
                <div className="flex justify-center mb-4 transition-transform group-hover:scale-110">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-blue-400">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Featured Companies */}
      <section id="companies" className="py-16 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">Featured Sri Lankan Companies</h2>
          <p className="text-center text-slate-400 mb-12">Live prices updated every 15 seconds from CSE</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStocks.map((company, index) => (
              <div key={index} className="card border-l-4 border-blue-500/50 flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-1">{company.name}</h4>
                  <p className="text-slate-400 text-sm mb-2">{company.sector}</p>
                  <p className={`text-xl font-bold ${company.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {company.price}
                    <span className="ml-2 text-sm font-normal opacity-80">{company.change}</span>
                  </p>
                </div>
                <div className={`text-2xl ${company.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {company.positive ? '▲' : '▼'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card border-t-4 border-blue-500">
            <h2 className="text-3xl font-bold mb-6 text-white">About Invezt</h2>
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Our Mission for Sri Lankan Investors</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Democratizing stock analysis by providing professional-grade valuation tools specifically designed for the Colombo Stock Exchange.
              We empower Sri Lankan investors from beginners to experts with data-driven insights.
            </p>
            <Link to="/login" className="btn btn-primary bg-blue-600 hover:bg-blue-500">Start Analyzing CSE Stocks</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;