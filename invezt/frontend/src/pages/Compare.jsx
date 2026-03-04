import { useState } from 'react';
import Header from '../components/layout/Header';

const Compare = () => {
  const [company1, setCompany1] = useState('JKH.N0000');
  const [company2, setCompany2] = useState('COMB.N0000');
  const [company3, setCompany3] = useState('HNB.N0000');

  const comparisonData = [
    { ratio: 'P/E Ratio', jkh: '18.3', comb: '6.7', hnb: '5.2' },
    { ratio: 'PEG Ratio', jkh: '1.1', comb: '0.8', hnb: '0.6' },
    { ratio: 'ROE (%)', jkh: '12.5%', comb: '15.8%', hnb: '18.2%' },
    { ratio: 'EPS (LKR)', jkh: '8.45', comb: '25.30', hnb: '32.15' },
    { ratio: 'P/B Ratio', jkh: '1.8', comb: '0.9', hnb: '0.8' },
    { ratio: 'Dividend Yield', jkh: '2.1%', comb: '4.5%', hnb: '5.2%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-12 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Company Comparison</h1>
          <p className="text-lg opacity-90">Compare up to 3 Sri Lankan companies side by side with key financial ratios</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Select Companies to Compare</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company 1</label>
              <input
                type="text"
                value={company1}
                onChange={(e) => setCompany1(e.target.value)}
                placeholder="Enter company name or ticker"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company 2</label>
              <input
                type="text"
                value={company2}
                onChange={(e) => setCompany2(e.target.value)}
                placeholder="Enter company name or ticker"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company 3</label>
              <input
                type="text"
                value={company3}
                onChange={(e) => setCompany3(e.target.value)}
                placeholder="Enter company name or ticker"
                className="input"
              />
            </div>
          </div>
          <button className="btn btn-primary">Compare Companies</button>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Comparison Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Financial Ratio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">JKH (John Keells)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">COMB (Commercial Bank)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">HNB (Hatton National)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.ratio}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.jkh}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.comb}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.hnb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-6">Investment Recommendation</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                Best for Value Investing: HNB (Hatton National Bank)
              </h3>
              <p className="text-gray-700">
                Lowest P/E and P/B ratios with highest ROE and dividend yield suggest strong value opportunity.
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Best for Growth Investing: JKH (John Keells Holdings)
              </h3>
              <p className="text-gray-700">
                Diversified business model and consistent growth across sectors indicate long-term growth potential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;