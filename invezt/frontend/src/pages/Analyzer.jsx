import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { companies } from '../data/companies';
import { financialRatios } from '../data/financialRatios';

const Analyzer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Developer's Analyzer Form State
  const [stocks, setStocks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    ticker: '', companyName: '', sector: '', currentPrice: '',
    marketCap: '', volume: '', quantity: '', avgCost: '',
    eps: '', peRatio: '', pbRatio: '', roe: '', dividendYield: '',
    currentRatio: '', quickRatio: '', pegRatio: '', beta: '', earningsYield: ''
  });

  // State from old Analyzer
  const [searchTerm, setSearchTerm] = useState('');
  const [timePeriod, setTimePeriod] = useState('Daily');

  useEffect(() => {
    // Check if we navigated here to edit a stock
    if (location.state?.editStock) {
      const stock = location.state.editStock;
      setEditingId(stock._id);
      setFormData({
        ticker: stock.ticker, companyName: stock.companyName, sector: stock.sector,
        currentPrice: stock.currentPrice, marketCap: stock.marketCap || '', volume: stock.volume || '',
        quantity: stock.holdings?.quantity || '', avgCost: stock.holdings?.avgCost || '',
        eps: stock.ratios?.eps || '', peRatio: stock.ratios?.peRatio || '', pbRatio: stock.ratios?.pbRatio || '',
        roe: stock.ratios?.roe || '', dividendYield: stock.ratios?.dividendYield || '',
        currentRatio: stock.ratios?.currentRatio || '', quickRatio: stock.ratios?.quickRatio || '',
        pegRatio: stock.ratios?.pegRatio || '', beta: stock.ratios?.beta || '', earningsYield: stock.ratios?.earningsYield || ''
      });
      // Clear location state so a refresh doesn't trigger edit mode again
      navigate(location.pathname, { replace: true });
      
      // Scroll to database section
      setTimeout(() => {
        const el = document.getElementById('database-section');
        if (el) window.scrollTo({ top: el.offsetTop - 50, behavior: 'smooth' });
      }, 100);
    }
    
    // Fetch Stocks so we can update them on submit
    fetch('http://localhost:5000/api/stocks')
      .then(response => response.json())
      .then(data => setStocks(data))
      .catch(error => console.error("Error fetching stocks:", error));
  }, [location, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAutoFetch = async () => {
    if (!formData.ticker) return alert("Please enter a Ticker symbol first!");
    try {
      setFormData(prev => ({ ...prev, currentPrice: 'Fetching...' }));
      const response = await fetch(`http://localhost:5000/api/quote/${formData.ticker}`);
      const result = await response.json();
      if (response.ok) setFormData(prev => ({ ...prev, currentPrice: result.currentPrice, volume: result.volume }));
      else { alert('❌ ' + result.message); setFormData(prev => ({ ...prev, currentPrice: '' })); }
    } catch (error) {
      console.error("Error fetching live quote:", error);
      setFormData(prev => ({ ...prev, currentPrice: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stockData = {
      ticker: formData.ticker, companyName: formData.companyName, sector: formData.sector,
      currentPrice: Number(formData.currentPrice), marketCap: Number(formData.marketCap), volume: Number(formData.volume),
      holdings: { quantity: Number(formData.quantity) || 0, avgCost: Number(formData.avgCost) || 0 },
      ratios: {
        eps: Number(formData.eps), peRatio: Number(formData.peRatio), pbRatio: Number(formData.pbRatio),
        roe: Number(formData.roe), dividendYield: Number(formData.dividendYield), currentRatio: Number(formData.currentRatio),
        quickRatio: Number(formData.quickRatio), pegRatio: Number(formData.pegRatio), beta: Number(formData.beta), earningsYield: Number(formData.earningsYield)
      }
    };

    try {
      const url = editingId ? `http://localhost:5000/api/stocks/${editingId}` : 'http://localhost:5000/api/stocks';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stockData) });
      const result = await response.json();

      if (response.ok) {
        if (editingId) setStocks(stocks.map(s => s._id === editingId ? result.data : s));
        else setStocks([...stocks, result.data]);
        setFormData({
          ticker: '', companyName: '', sector: '', currentPrice: '', marketCap: '', volume: '', quantity: '', avgCost: '',
          eps: '', peRatio: '', pbRatio: '', roe: '', dividendYield: '', currentRatio: '', quickRatio: '', pegRatio: '', beta: '', earningsYield: ''
        });
        setEditingId(null);
        alert('Analysis Saved Successfully!');
        navigate('/dashboard'); // Go back to dashboard after saving
      }
    } catch (error) { console.error("Failed to save:", error); }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex justify-center items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-500">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">½</span>}
      </div>
    );
  };

  const getRatingClass = (rating) => {
    if (rating >= 4.5) return 'bg-green-50 border-l-4 border-r-4 border-green-500';
    if (rating >= 3.5) return 'bg-blue-50 border-l-4 border-r-4 border-blue-500';
    return 'bg-red-50 border-l-4 border-r-4 border-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Developer's App.jsx Market Analyzer Engine Form */}
        <div style={{ paddingTop: '20px', marginBottom: '40px' }} className="bg-slate-900 p-8 rounded-2xl">
          <h1 style={{ color: '#f8fafc', marginBottom: '20px', fontSize: '28px', fontWeight: 'bold' }}>Invezt Market Analyzer Engine</h1>
          <div id="database-section" style={styles.formCard} className="no-print">
            <h2 style={{ color: '#f8fafc', marginBottom: '20px', fontSize: '18px' }}>{editingId ? '✏️ Edit Position' : '➕ Add New Ticker for Analysis'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input name="ticker" placeholder="Ticker (e.g. COMB)" value={formData.ticker} onChange={handleChange} required disabled={!!editingId} style={{ ...styles.input, flex: 1 }} />
                <button type="button" onClick={handleAutoFetch} disabled={!!editingId} style={styles.fetchBtn}>🔍 Auto-Fetch</button>
              </div>

              <div style={{ padding: '15px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #3b82f6', marginBottom: '15px' }}>
                <h4 style={{ color: '#60a5fa', marginBottom: '10px' }}>My Holdings (Optional)</h4>
                <div style={styles.inputGroup}>
                  <input name="quantity" placeholder="Shares Owned" value={formData.quantity} onChange={handleChange} style={styles.input} />
                  <input name="avgCost" placeholder="Average Cost" value={formData.avgCost} onChange={handleChange} style={styles.input} />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <input name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} required style={styles.input} />
                <input name="sector" placeholder="Sector" value={formData.sector} onChange={handleChange} required style={styles.input} />
                <input name="currentPrice" placeholder="Price (LKR)" value={formData.currentPrice} onChange={handleChange} required style={styles.input} />
                <input name="eps" placeholder="EPS" value={formData.eps} onChange={handleChange} style={styles.input} />
                <input name="peRatio" placeholder="P/E Ratio" value={formData.peRatio} onChange={handleChange} style={styles.input} />
                <input name="pbRatio" placeholder="P/B Ratio" value={formData.pbRatio} onChange={handleChange} style={styles.input} />
                <input name="roe" placeholder="ROE (%)" value={formData.roe} onChange={handleChange} style={styles.input} />
                <input name="dividendYield" placeholder="Div Yield (%)" value={formData.dividendYield} onChange={handleChange} style={styles.input} />
                <input name="currentRatio" placeholder="Current Ratio" value={formData.currentRatio} onChange={handleChange} style={styles.input} />
                <input name="quickRatio" placeholder="Quick Ratio" value={formData.quickRatio} onChange={handleChange} style={styles.input} />
                <input name="pegRatio" placeholder="PEG Ratio" value={formData.pegRatio} onChange={handleChange} style={styles.input} />
                <input name="beta" placeholder="Beta (Volatility)" value={formData.beta} onChange={handleChange} style={styles.input} />
                <input name="earningsYield" placeholder="Earnings Yield (%)" value={formData.earningsYield} onChange={handleChange} style={styles.input} />
              </div>
              <button type="submit" style={styles.submitBtn}>{editingId ? 'Update Analytics' : 'Save to Database'}</button>
            </form>
          </div>
        </div>

        {/* Existing Analyzer View */}
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">Stock Analysis</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter company name or ticker"
              className="flex-1 min-w-[300px] px-4 py-3 rounded-lg text-gray-900"
            />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-4 py-3 rounded-lg text-gray-900"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
            <button className="btn bg-primary-dark text-white hover:bg-primary">
              Analyze Stock
            </button>
          </div>
          <p className="text-sm opacity-90">Search for any publicly traded company to get detailed financial analysis</p>
        </div>

        {companies.map((company) => (
          <div key={company.id} className="card bg-secondary mb-6 text-white">
            <h3 className="text-2xl font-bold mb-4">{company.name} ({company.ticker})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Founded</div>
                <div className="text-xl font-bold text-primary">{company.founded}</div>
              </div>
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Market Cap</div>
                <div className="text-xl font-bold text-primary">{company.marketCap}</div>
              </div>
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">CEO</div>
                <div className="text-xl font-bold text-primary">{company.ceo}</div>
              </div>
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Sector</div>
                <div className="text-xl font-bold text-primary">{company.sector}</div>
              </div>
            </div>
          </div>
        ))}

        <h3 className="text-2xl font-bold text-primary mb-6 border-b-2 border-gray-200 pb-3">
          Key Financial Ratios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financialRatios.map((ratio, index) => (
            <div key={index} className={`card ${getRatingClass(ratio.rating)}`}>
              <div className="text-center">
                <h4 className="font-semibold text-gray-800 mb-2">{ratio.name}</h4>
                <div className="text-3xl mb-2">{renderStars(ratio.rating)}</div>
                <p className="text-sm text-gray-600">{ratio.meaning}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-primary mt-12 mb-6 border-b-2 border-gray-200 pb-3">
          Stock Performance Charts
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <span className="font-semibold text-gray-800">{company.name} ({company.ticker})</span>
                <div className="text-right">
                  <div className="font-bold text-green-600">LKR {company.currentPrice}</div>
                  <div className={`text-sm ${company.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {company.change >= 0 ? '+' : ''}{company.change}%
                  </div>
                </div>
              </div>
              <div className="h-32 bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-lg flex items-end p-4">
                <div className="text-xs text-gray-500">Chart visualization would go here</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  formCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155' },
  form: { width: '100%' },
  inputGroup: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' },
  fetchBtn: { padding: '0 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: { marginTop: '20px', padding: '12px 25px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }
};

export default Analyzer;