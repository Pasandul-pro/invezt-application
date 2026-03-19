import { useState } from 'react';
import Header from '../components/layout/Header';
import { Upload } from 'lucide-react';

const CompanyReport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      setShowAnalysis(true);
    } else {
      alert('Please select a file first.');
    }
  };

  const financialRatiosAnalysis = [
    { name: 'Return on Equity (ROE)', value: '15.2%', status: 'ok', description: 'Profitability ratio measuring net income as a percentage of shareholders\' equity', interpretation: 'Strong profitability, efficient management' },
    { name: 'Earnings per Share (EPS)', value: '$4.32', status: 'ok', description: 'Company\'s profit allocated to each outstanding share', interpretation: 'High earnings attract investors' },
    { name: 'P/E Ratio', value: '18.5', status: 'ok', description: 'Price-to-Earnings ratio shows how much investors pay per unit of earnings', interpretation: 'Reasonable valuation compared to industry' },
    { name: 'Debt-to-Equity (D/E)', value: '0.45', status: 'ok', description: 'Measures financial leverage and risk', interpretation: 'Moderate debt level, manageable risk' },
    { name: 'Current Ratio', value: '1.8', status: 'ok', description: 'Short-term liquidity and ability to pay obligations', interpretation: 'Good short-term financial health' },
    { name: 'Quick Ratio', value: '0.9', status: 'not-ok', description: 'Immediate liquidity excluding inventory', interpretation: 'Potential cash shortages in short term' },
    { name: 'Return on Assets (ROA)', value: '6.8%', status: 'ok', description: 'Efficiency of using assets to generate profit', interpretation: 'Efficient asset utilization' },
    { name: 'Gross Profit Margin', value: '42%', status: 'ok', description: 'Production efficiency and pricing power', interpretation: 'Strong pricing control' },
    { name: 'Net Profit Margin', value: '12.5%', status: 'ok', description: 'Overall profitability after all expenses', interpretation: 'Efficient cost management' },
    { name: 'Dividend Yield', value: '2.1%', status: 'not-ok', description: 'Dividend income relative to stock price', interpretation: 'Below industry average for income stocks' },
  ];

  const okCount = financialRatiosAnalysis.filter(r => r.status === 'ok').length;
  const notOkCount = financialRatiosAnalysis.length - okCount;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-900/40 to-blue-600/20 border border-blue-500/30 text-white rounded-2xl p-12 text-center mb-8 backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-4">Financial Report Analysis</h1>
          <p className="text-lg opacity-90 text-blue-100">Upload financial documents for automated analysis and valuation insights</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Upload Financial Report</h2>
          
          <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-900/50">
            <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Drag & drop your financial report here or click to browse</p>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
            <label
              htmlFor="fileInput"
              className="btn btn-primary bg-blue-600 hover:bg-blue-500 cursor-pointer inline-block"
            >
              Choose File
            </label>
            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <strong className="text-blue-400">Selected file:</strong>{' '}
                <span className="text-slate-300">{selectedFile.name}</span>
              </div>
            )}
          </div>
          
          <button onClick={handleAnalyze} className="btn btn-primary bg-blue-600 hover:bg-blue-500 w-full mt-6">
            Analyze Report
          </button>
        </div>

        {showAnalysis && (
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-slate-800 pb-3">
              Financial Ratio Analysis
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {financialRatiosAnalysis.map((ratio, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg shadow-md transition-all border ${
                    ratio.status === 'ok'
                      ? 'bg-green-900/10 border-green-500/30'
                      : 'bg-red-900/10 border-red-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-white">{ratio.name}</h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        ratio.status === 'ok'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {ratio.status === 'ok' ? 'OK' : 'Needs Attention'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mb-2">{ratio.value}</div>
                  <p className="text-sm text-slate-400 mb-2">{ratio.description}</p>
                  <p className="text-sm italic text-slate-300">{ratio.interpretation}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4">Summary</h3>
              <p className="text-slate-300 leading-relaxed">
                The financial analysis shows {okCount} out of {financialRatiosAnalysis.length} key ratios are in good standing. 
                The company demonstrates strong profitability with healthy ROE and profit margins. 
                {notOkCount > 0 && (
                  <> However, {notOkCount} ratio{notOkCount > 1 ? 's' : ''} need{notOkCount > 1 ? '' : 's'} attention, 
                  particularly regarding liquidity and dividend yield.</>
                )}
                {' '}Overall, the company appears to be in a stable financial position with room for improvement in specific areas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyReport;