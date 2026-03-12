import { useState } from 'react';
import Header from '../components/layout/Header';
import { compareCompanies } from '../api/compareApi.js';

const Compare = () => {
  const [symbols, setSymbols] = useState(['JKH.N0000', 'COMB.N0000', 'HNB.N0000']);
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleCompare = async () => {
    const validSymbols = symbols.map(s => s.trim().toUpperCase()).filter(Boolean);
    if (validSymbols.length < 2) {
      setError('Please enter at least 2 company symbols.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await compareCompanies({
        symbols: validSymbols.join(','),
        periodType: 'ANNUAL',
        year
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ratioRows = [
    { key: 'pe',                   label: 'P/E Ratio' },
    { key: 'peg',                  label: 'PEG Ratio' },
    { key: 'roePercent',           label: 'ROE (%)' },
    { key: 'roaPercent',           label: 'ROA (%)' },
    { key: 'eps',                  label: 'EPS (LKR)' },
    { key: 'debtToEquity',         label: 'Debt / Equity' },
    { key: 'currentRatio',         label: 'Current Ratio' },
    { key: 'grossProfitMarginPercent', label: 'Profit Margin (%)' },
    { key: 'epsGrowthPercent',     label: 'EPS Growth (%)' },
  ];

  const companies = result?.companies || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-12 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Company Comparison</h1>
          <p className="text-lg opacity-90">Compare up to 3 CSE-listed companies with live financial data + AI insights</p>
        </div>

        {/* Selection form */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Select Companies to Compare</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {[0, 1, 2].map(i => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company {i + 1}</label>
                <input
                  type="text"
                  value={symbols[i]}
                  onChange={e => {
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Year</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="input"
                min="2018"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <button
            onClick={handleCompare}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Comparing...' : 'Compare Companies'}
          </button>
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-sm">{error}</div>
          )}
        </div>

        {/* Results table */}
        {result && (
          <>
            <div className="card mb-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Comparison Results – {year}</h2>

              {/* Live prices row */}
              <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${companies.length + 1}, 1fr)` }}>
                <div className="font-semibold text-gray-700">Live Price (LKR)</div>
                {companies.map(c => (
                  <div key={c.symbol} className="font-bold text-primary text-lg">
                    {c.missing ? '—' : (c.lastPrice != null ? c.lastPrice.toFixed(2) : 'Market closed')}
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Financial Ratio</th>
                      {companies.map(c => (
                        <th key={c.symbol} className="px-6 py-4 text-left text-sm font-semibold text-primary">
                          {c.symbol}
                          {c.missing && <span className="ml-2 text-red-400 text-xs font-normal">(no data)</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ratioRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.label}</td>
                        {companies.map(c => (
                          <td key={c.symbol} className="px-6 py-4 text-sm text-gray-700">
                            {c.missing ? '—' : (c.ratios?.[row.key] != null ? c.ratios[row.key] : 'N/A')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Insights */}
            {result.aiInsights && (
              <div className="card">
                <h2 className="text-2xl font-bold text-primary mb-4">🤖 AI Investment Insights</h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">
                    {result.aiInsights}
                  </pre>
                </div>
                <p className="text-xs text-gray-400 mt-3">Powered by GPT-4o · Based on {year} annual financials</p>
              </div>
            )}

            {!result.aiInsights && companies.some(c => !c.missing) && (
              <div className="card bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-yellow-800 text-sm">
                  ⚠ AI insights unavailable — financial data for these companies may not yet be in the database. 
                  The live CSE prices and ratios above are calculated from available data.
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