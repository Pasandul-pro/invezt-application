import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const MarketHighlights = () => {
  const highlights = [
    {
      name: 'ASPI',
      value: '12,450.75',
      change: '+1.2%',
      positive: true,
      icon: <TrendingUp className="w-8 h-8" />,
    },
    {
      name: 'S&P SL20',
      value: '3,845.20',
      change: '+0.8%',
      positive: true,
      icon: <TrendingUp className="w-8 h-8" />,
    },
    {
      name: 'LKR/USD',
      value: '322.50',
      change: '-0.2%',
      positive: false,
      icon: <DollarSign className="w-8 h-8" />,
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Market Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlights.map((item, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-l-4 ${
              item.positive ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {item.name}
                </h3>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div className={`${item.positive ? 'text-green-500' : 'text-red-500'}`}>
                {item.icon}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.positive ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <span
                className={`text-lg font-bold ${
                  item.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketHighlights;