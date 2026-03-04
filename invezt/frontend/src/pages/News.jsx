import { useState } from 'react';
import Header from '../components/layout/Header';
import { newsData } from '../data/newsData';

const News = () => {
  const [notifications, setNotifications] = useState({
    priceAlertsPush: true,
    priceAlertsEmail: false,
    earningsReportsPush: true,
    earningsReportsEmail: true,
    quarterlyReportsPush: false,
    quarterlyReportsEmail: true,
    marketNewsPush: true,
    marketNewsEmail: false,
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingsItems = [
    { key: 'priceAlertsPush', label: 'Price Alerts (Push)' },
    { key: 'priceAlertsEmail', label: 'Price Alerts (Email)' },
    { key: 'earningsReportsPush', label: 'Earnings Reports (Push)' },
    { key: 'earningsReportsEmail', label: 'Earnings Reports (Email)' },
    { key: 'quarterlyReportsPush', label: 'Quarterly Financial Reports (Push)' },
    { key: 'quarterlyReportsEmail', label: 'Quarterly Financial Reports (Email)' },
    { key: 'marketNewsPush', label: 'Market News Updates (Push)' },
    { key: 'marketNewsEmail', label: 'Market News Updates (Email)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-12 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Stay Informed with Latest News & Notifications</h1>
          <p className="text-lg opacity-90">
            Get daily market updates and customize notifications for price alerts and financial reports
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {newsData.map((news) => (
            <div key={news.id} className="card hover:scale-105 transition-transform">
              <h3 className="text-xl font-semibold text-primary mb-3">{news.title}</h3>
              <div className="bg-gray-50 border-l-4 border-primary-light px-4 py-2 rounded mb-4">
                <span className="font-mono font-bold text-sm text-gray-700">{news.date}</span>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{news.summary}</p>
              <button className="btn btn-primary w-full">Read More</button>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-4 border-b-2 border-gray-200 pb-3">
            Notification Settings
          </h2>
          <p className="text-gray-600 mb-6">
            Customize your alerts for price changes and financial report updates. Choose between push notifications and email.
          </p>
          
          <div className="space-y-4">
            {settingsItems.map((item) => (
              <div key={item.key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label htmlFor={item.key} className="font-medium text-gray-800 cursor-pointer">
                  {item.label}
                </label>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={notifications[item.key]}
                    onChange={() => handleToggle(item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-light cursor-pointer transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button className="btn btn-primary">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;