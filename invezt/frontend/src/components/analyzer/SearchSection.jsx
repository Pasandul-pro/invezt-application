import { useState } from 'react';

const SearchSection = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timePeriod, setTimePeriod] = useState('Daily');

  const handleSearch = () => {
    onSearch({ searchTerm, timePeriod });
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-8 mb-8 shadow-xl">
      <h2 className="text-3xl font-bold mb-6">Stock Analysis</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter company name or ticker"
          className="flex-1 min-w-[300px] px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
        <button 
          onClick={handleSearch}
          className="px-8 py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-primary transition-all hover:shadow-lg active:scale-95"
        >
          Analyze Stock
        </button>
      </div>
      <p className="text-sm opacity-90">
        Search for any publicly traded company to get detailed financial analysis
      </p>
    </div>
  );
};

export default SearchSection;