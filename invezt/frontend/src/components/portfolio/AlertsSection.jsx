import { AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const AlertsSection = () => {
  const alerts = [
    {
      type: 'success',
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Price Alert',
      message: 'JKH.N0000 increased by 8% this week.',
    },
    {
      type: 'warning',
      icon: <TrendingDown className="w-5 h-5" />,
      title: 'Market Update',
      message: 'COMB.N0000 fell 4.5% due to reduced quarterly profits.',
    },
    {
      type: 'info',
      icon: <DollarSign className="w-5 h-5" />,
      title: 'News',
      message: 'HNB announces dividend payout for Q3 2025.',
    },
  ];

  const getAlertStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-900';
      case 'warning':
        return 'bg-red-50 border-red-500 text-red-900';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`border-l-4 p-4 rounded-lg flex items-start gap-3 ${getAlertStyles(alert.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">{alert.icon}</div>
          <div className="flex-1">
            <strong className="font-semibold block mb-1">{alert.title}:</strong>
            <span className="text-sm">{alert.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsSection;