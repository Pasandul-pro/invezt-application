import { useState } from 'react';
import Header from '../components/layout/Header';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Portfolio = () => {
  const [portfolioItems] = useState([
    { company: 'JKH.N0000', shares: 100, avgCost: 180.50, currentPrice: 195.00, gain: 8.0 },
    { company: 'COMB.N0000', shares: 150, avgCost: 48.20, currentPrice: 46.00, gain: -4.5 },
  ]);

  const [watchlistItems] = useState([
    { company: 'HNB.N0000', currentPrice: 121.50, change: 2.5 },
    { company: 'SAMP.N0000', currentPrice: 62.40, change: -1.1 },
  ]);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Portfolio Value (LKR)',
        data: [25000, 26500, 27800, 27500, 29000, 31000, 33000, 36120],
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Portfolio Value (LKR)' },
      },
      x: {
        title: { display: true, text: 'Month' },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-12 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Portfolio & Watchlist</h1>
          <p className="text-lg opacity-90">View, track, and manage your selected stocks — all in one place</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">My Portfolio</h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <input type="text" placeholder="Company or Ticker" className="input" />
            <input type="number" placeholder="Shares" className="input" />
            <input type="number" step="0.01" placeholder="Purchase Price (LKR)" className="input" />
            <input type="number" step="0.01" placeholder="Current Price (LKR)" className="input" />
          </div>
          <button className="btn btn-primary mb-6">Add to Portfolio</button>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Shares</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Avg. Cost (LKR)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Current Price (LKR)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Value (LKR)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Gain/Loss (%)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolioItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{item.company}</td>
                    <td className="px-4 py-3 text-sm">{item.shares}</td>
                    <td className="px-4 py-3 text-sm">{item.avgCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{item.currentPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{(item.shares * item.currentPrice).toFixed(2)}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${item.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.gain >= 0 ? '+' : ''}{item.gain}%
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Portfolio Growth Over Time</h2>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Watchlist</h2>
          <div className="flex gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Add Company or Ticker to Watchlist (e.g., HNB.N0000)" 
              className="input flex-1"
            />
            <button className="btn btn-primary">Add to Watchlist</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Current Price (LKR)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Change (%)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Action</th>
                </tr>
              </thead>
              <tbody>
                {watchlistItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{item.company}</td>
                    <td className="px-4 py-3 text-sm">{item.currentPrice.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-6">Alerts & Updates</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <strong className="text-blue-900">Price Alert:</strong> JKH.N0000 increased by 8% this week.
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <strong className="text-red-900">Market Update:</strong> COMB.N0000 fell 4.5% due to reduced quarterly profits.
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <strong className="text-green-900">News:</strong> HNB announces dividend payout for Q3 2025.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;