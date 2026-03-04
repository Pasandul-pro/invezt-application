import { useState } from 'react';
import Header from '../components/layout/Header';
import { companies } from '../data/companies';
import { financialRatios } from '../data/financialRatios';

const Analyzer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timePeriod, setTimePeriod] = useState('Daily');

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

export default Analyzer;