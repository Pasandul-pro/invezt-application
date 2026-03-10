import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import Header from '../components/layout/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketHighlights, setMarketHighlights] = useState(null);
  const [filterSignal, setFilterSignal] = useState('ALL');
  const [liveUsd, setLiveUsd] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:5000/api/stocks')
      .then(response => response.json())
      .then(data => setStocks(data))
      .catch(error => console.error("Error fetching stocks:", error));

    fetch('http://localhost:5000/api/market-highlights')
      .then(response => response.json())
      .then(data => setMarketHighlights(data))
      .catch(error => console.error("Error fetching market data:", error));

    fetch('https://open.er-api.com/v6/latest/USD')
      .then(response => response.json())
      .then(data => {
        if (data && data.rates && data.rates.LKR) {
          setLiveUsd(`Rs. ${data.rates.LKR.toFixed(2)}`);
        }
      })
      .catch(error => {
        console.error("Error fetching live USD:", error);
        setLiveUsd('Unavailable');
      });
  }, []);

  const handleEditClick = (stock) => {
    navigate('/analyzer', { state: { editStock: stock } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/stocks/${id}`, { method: 'DELETE' });
      if (response.ok) setStocks(stocks.filter((stock) => stock._id !== id));
    } catch (error) { console.error("Error deleting:", error); }
  };

  const getValuationSignal = (stock) => {
    const pe = Number(stock.ratios?.peRatio);
    const pb = Number(stock.ratios?.pbRatio);
    if (!pe || !pb) return { text: 'NO DATA', color: '#94a3b8', bg: '#334155' };
    if (pe < 12 && pb < 1.2) return { text: '🔥 STRONG BUY', color: '#22c55e', bg: '#22c55e20' };
    if (pe < 16 && pb < 1.6) return { text: '✅ BUY', color: '#4ade80', bg: '#4ade8020' };
    if (pe > 25 || pb > 3) return { text: '🚨 OVERVALUED', color: '#ef4444', bg: '#ef444420' };
    return { text: '⚖️ HOLD', color: '#eab308', bg: '#eab30820' };
  };

  const calculateGrahamRaw = (stock) => {
    const eps = Number(stock.ratios?.eps);
    const pb = Number(stock.ratios?.pbRatio);
    const price = Number(stock.currentPrice);
    if (!eps || !pb || !price || eps <= 0 || pb <= 0) return 0;
    return Math.sqrt(22.5 * eps * (price / pb));
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

  const chartData = processedStocks.map(stock => ({ name: stock.ticker, MarketPrice: Number(stock.currentPrice), GrahamValue: calculateGrahamRaw(stock) }));
  
  const sectorDataRaw = processedStocks.reduce((acc, stock) => {
    const contribution = (stock.holdings?.quantity || 0) * (stock.currentPrice || 0) > 0 ? (stock.holdings?.quantity || 0) * (stock.currentPrice || 0) : 1;
    if (stock.sector) acc[stock.sector] = (acc[stock.sector] || 0) + contribution;
    return acc;
  }, {});
  const sectorData = Object.keys(sectorDataRaw).map(sector => ({ name: sector, value: sectorDataRaw[sector] }));
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div style={styles.pageWrapper} className="page-wrapper bg-[#0f172a] min-h-screen text-slate-50">
      <Header />
      <style>
        {`@media print { .no-print { display: none !important; } body, .page-wrapper { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: #0f172a !important; } .print-card { page-break-inside: avoid; break-inside: avoid; margin-bottom: 20px !important; } }`}
      </style>

      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={{ fontSize: '36px', marginBottom: '15px' }}>Welcome to Your Dashboard</h1>
          <p style={{ opacity: 0.9, fontSize: '18px' }}>Track, analyze, and manage your investments in Sri Lankan stocks</p>
        </div>

        <h2 style={{ color: '#f8fafc', marginBottom: '20px' }} className="no-print">Quick Actions</h2>
        <div style={styles.quickActionsGrid} className="no-print">
          <div style={styles.actionCard}>
            <h3 style={styles.actionCardTitle}>Analyze Stock</h3>
            <p style={styles.actionCardText}>Search and analyze any Sri Lankan stock</p>
            <button onClick={() => navigate('/analyzer')} style={styles.actionBtn}>Go</button>
          </div>
          <div style={styles.actionCard}>
            <h3 style={styles.actionCardTitle}>Compare Companies</h3>
            <p style={styles.actionCardText}>Compare up to 3 Sri Lankan companies</p>
            <button onClick={() => navigate('/compare')} style={styles.actionBtn}>Go</button>
          </div>
          <div style={styles.actionCard}>
            <h3 style={styles.actionCardTitle}>Create Portfolio</h3>
            <p style={styles.actionCardText}>Build and track your portfolio</p>
            <button onClick={() => navigate('/portfolio')} style={styles.actionBtn}>Go</button>
          </div>
          <div style={styles.actionCard}>
            <h3 style={styles.actionCardTitle}>Valuation Models</h3>
            <p style={styles.actionCardText}>Learn about CAPM, DCF, and other models</p>
            <button onClick={() => navigate('/valuation-models')} style={styles.actionBtn}>Go</button>
          </div>
          <div style={styles.actionCard}>
            <h3 style={styles.actionCardTitle}>Company Reports</h3>
            <p style={styles.actionCardText}>Valuate your company Through Your Report</p>
            <button onClick={() => {
              alert("Please scroll down to the 'Company Report Valuation' section to upload your PDF report.");
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }} style={styles.actionBtn}>Go</button>
          </div>
        </div>

        <h2 style={{ color: '#f8fafc', marginTop: '30px', marginBottom: '20px' }}>Market Highlights</h2>
        <div style={styles.marketHighlights}>
          {['ASPI', 'S&P SL20', 'LKR/USD'].map((item, idx) => {
            const isPositive = marketHighlights ? (idx === 0 ? marketHighlights.aspi?.isPositive : idx === 1 ? marketHighlights.sp20?.isPositive : false) : true;
            const valueColor = idx === 2 ? '#ef4444' : (isPositive ? '#22c55e' : '#ef4444');

            return (
              <div key={item} style={styles.highlightCard}>
                <h3 style={styles.highlightHeader}>{item}</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: valueColor }}>
                  {idx === 2 ? liveUsd : (marketHighlights ? (idx === 0 ? marketHighlights.aspi?.value : marketHighlights.sp20?.value) : '...')}
                </p>
              </div>
            );
          })}
        </div>

        <div className="no-print">
          <div style={styles.newsCard}>
            <h3 style={styles.newsTitle}>Latest News</h3>
            <p style={styles.newsText}>John Keells Holdings reports strong quarterly earnings amid tourism sector recovery...</p>
            <button onClick={() => navigate('/news')} style={styles.actionBtnSecondary}>View All News & Notifications</button>
          </div>

          <h2 style={{ color: '#f8fafc', marginTop: '30px', marginBottom: '20px' }}>Daily Market Update</h2>
          <div style={styles.newsCard}>
            <h3 style={styles.newsTitle}>CSE Market Update</h3>
            <p style={styles.newsText}>Colombo Stock Exchange shows positive momentum with banking and manufacturing sectors leading gains.</p>
            <button onClick={() => navigate('/news')} style={styles.actionBtnSecondary}>Read More</button>
          </div>

          <h2 style={{ color: '#f8fafc', marginTop: '30px', marginBottom: '20px' }}>Company Report Valuation</h2>
          <div style={styles.newsCard}>
            <h3 style={styles.newsTitle}>Company Report Valuation</h3>
            <p style={styles.newsText}>Enter your company Report and Get the Evaluation directly applied to your analysis.</p>
            <label htmlFor="file-upload" style={{ ...styles.actionBtnSecondary, display: 'inline-block', textAlign: 'center' }}>Upload Report PDF</label>
            <input id="file-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={() => alert("File uploaded successfully. Our engine is parsing the data.")} />
          </div>
        </div>

        <hr style={{ border: '1px solid #334155', margin: '50px 0' }} className="no-print" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }} className="print-card">
          <div style={styles.chartCard}>
            <h3 style={{ color: '#f8fafc', marginBottom: '20px' }}>📊 Price vs. Intrinsic Value</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="GrahamValue" name="Graham Value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="MarketPrice" name="Market Price" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={styles.chartCard}>
            <h3 style={{ color: '#f8fafc', marginBottom: '20px' }}>🥧 Portfolio Sector Exposure</h3>
            <div style={{ width: '100%', height: 300 }}>
              {sectorData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {sectorData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No sector data available yet.</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }} className="no-print">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
            <input type="text" placeholder="🔍 Search by Ticker or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.input, minWidth: '200px' }} />
            <button onClick={() => setFilterSignal('ALL')} style={{ ...styles.filterBtn, background: filterSignal === 'ALL' ? '#3b82f6' : '#1e293b' }}>🌐 All</button>
            <button onClick={() => setFilterSignal('STRONG BUY')} style={{ ...styles.filterBtn, background: filterSignal === 'STRONG BUY' ? '#22c55e' : '#1e293b' }}>🔥 Strong Buy</button>
            <button onClick={() => setFilterSignal('BUY')} style={{ ...styles.filterBtn, background: filterSignal === 'BUY' ? '#4ade80' : '#1e293b', color: filterSignal === 'BUY' ? '#000' : '#fff' }}>✅ Buy</button>
            <button onClick={() => setFilterSignal('HOLD')} style={{ ...styles.filterBtn, background: filterSignal === 'HOLD' ? '#eab308' : '#1e293b' }}>⚖️ Hold</button>
            <button onClick={() => setFilterSignal('OVERVALUED')} style={{ ...styles.filterBtn, background: filterSignal === 'OVERVALUED' ? '#ef4444' : '#1e293b' }}>🚨 Overvalued</button>
          </div>
          <button onClick={() => window.print()} style={styles.pdfBtn}>📄 Download PDF Report</button>
        </div>

        <div style={styles.grid}>
          {processedStocks.map((stock) => {
            const signal = getValuationSignal(stock);
            const rawGraham = calculateGrahamRaw(stock);
            const expectedReturn = calculateCAPM(stock);
            const qty = stock.holdings?.quantity || 0;
            const cost = stock.holdings?.avgCost || 0;
            const totalInvested = qty * cost;
            const profitLoss = (qty * stock.currentPrice) - totalInvested;
            const profitLossPercent = totalInvested > 0 ? ((profitLoss / totalInvested) * 100).toFixed(2) : 0;
            const isProfit = profitLoss >= 0;

            return (
              <div key={stock._id} style={styles.card} className="print-card">
                <div style={styles.cardHeader}>
                  <h2 style={styles.ticker}>{stock.ticker}</h2>
                  <div className="no-print">
                    <button type="button" onClick={() => handleEditClick(stock)} style={styles.iconBtn}>✏️</button>
                    <button type="button" onClick={() => handleDelete(stock._id)} style={styles.iconBtn}>🗑️</button>
                  </div>
                </div>
                <p style={styles.companyName}>{stock.companyName}</p>
                <div style={styles.priceContainer}>
                  <span style={styles.price}>LKR {stock.currentPrice}</span>
                  <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: signal.color, backgroundColor: signal.bg }}>{signal.text}</span>
                </div>

                {qty > 0 && (
                  <div style={{ margin: '15px 0', padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: `4px solid ${isProfit ? '#22c55e' : '#ef4444'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>Holdings: <strong>{qty}</strong></span>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>Avg Price: <strong>LKR {cost}</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '14px' }}>Total P/L:</span>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: isProfit ? '#22c55e' : '#ef4444' }}>
                        {isProfit ? '+' : ''}LKR {profitLoss.toLocaleString()} ({isProfit ? '+' : ''}{profitLossPercent}%)
                      </span>
                    </div>
                  </div>
                )}

                <table style={styles.table}>
                  <tbody>
                    <tr style={styles.tableRow}><td style={styles.tableLabel}>Graham Number</td><td style={{ ...styles.tableValue, color: '#38bdf8' }}>{rawGraham > 0 ? `LKR ${rawGraham.toFixed(2)}` : 'N/A'}</td></tr>
                    <tr style={styles.tableRow}><td style={styles.tableLabel}>Expected Return (CAPM)</td><td style={{ ...styles.tableValue, color: '#f59e0b' }}>{expectedReturn ? `${expectedReturn}%` : 'N/A'}</td></tr>
                    <tr style={styles.tableRow}><td style={styles.tableLabel}>P/E Ratio</td><td style={styles.tableValue}>{stock.ratios?.peRatio || '-'}</td></tr>
                    <tr style={styles.tableRow}><td style={styles.tableLabel}>P/B Ratio</td><td style={styles.tableValue}>{stock.ratios?.pbRatio || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: { fontFamily: 'Inter, sans-serif' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  hero: { background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', padding: '40px', borderRadius: '10px', textAlign: 'center', marginBottom: '30px' },
  quickActionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '20px 0 40px 0' },
  actionCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '10px', textAlign: 'center', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' },
  actionCardTitle: { color: '#60a5fa', marginBottom: '10px', fontSize: '18px' },
  actionCardText: { color: '#94a3b8', fontSize: '14px', marginBottom: '20px', flex: 1 },
  actionBtn: { padding: '10px 20px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'inline-block', fontWeight: 'bold', width: '100%' },
  actionBtnSecondary: { padding: '8px 16px', backgroundColor: '#334155', color: '#f8fafc', border: '1px solid #475569', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginTop: '10px', width: 'fit-content' },
  newsCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '10px', border: '1px solid #334155', marginTop: '10px' },
  newsTitle: { color: '#60a5fa', marginBottom: '10px', fontSize: '18px' },
  newsText: { color: '#94a3b8', marginBottom: '15px', fontSize: '14px' },
  marketHighlights: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
  highlightCard: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px solid #334155' },
  highlightHeader: { color: '#94a3b8', fontSize: '14px', marginBottom: '10px' },
  chartCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155', height: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  ticker: { fontSize: '20px', margin: 0, fontWeight: 'bold' },
  companyName: { color: '#94a3b8', fontSize: '14px', margin: '0 0 15px 0' },
  priceContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  price: { fontSize: '22px', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableRow: { borderBottom: '1px solid #334155' },
  tableLabel: { padding: '10px 0', color: '#94a3b8', fontSize: '14px' },
  tableValue: { textAlign: 'right', fontWeight: 'bold', fontSize: '14px' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
  filterBtn: { padding: '8px 16px', color: 'white', border: '1px solid #334155', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  pdfBtn: { padding: '10px 20px', backgroundColor: '#f43f5e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }
};

export default Dashboard;