import { useState } from 'react';
import { Bell, Mail, Save } from 'lucide-react';

const NotificationSettings = () => {
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
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    console.log('Saving notification settings:', notifications);
    alert('Settings saved successfully!');
  };

  const settingsGroups = [
    {
      category: 'Price Alerts',
      items: [
        { key: 'priceAlertsPush', label: 'Push Notifications', icon: <Bell className="w-4 h-4" /> },
        { key: 'priceAlertsEmail', label: 'Email Notifications', icon: <Mail className="w-4 h-4" /> },
      ],
    },
    {
      category: 'Earnings Reports',
      items: [
        { key: 'earningsReportsPush', label: 'Push Notifications', icon: <Bell className="w-4 h-4" /> },
        { key: 'earningsReportsEmail', label: 'Email Notifications', icon: <Mail className="w-4 h-4" /> },
      ],
    },
    {
      category: 'Quarterly Financial Reports',
      items: [
        { key: 'quarterlyReportsPush', label: 'Push Notifications', icon: <Bell className="w-4 h-4" /> },
        { key: 'quarterlyReportsEmail', label: 'Email Notifications', icon: <Mail className="w-4 h-4" /> },
      ],
    },
    {
      category: 'Market News Updates',
      items: [
        { key: 'marketNewsPush', label: 'Push Notifications', icon: <Bell className="w-4 h-4" /> },
        { key: 'marketNewsEmail', label: 'Email Notifications', icon: <Mail className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-primary mb-4 border-b-2 border-gray-200 pb-3">
        Notification Settings
      </h2>
      <p className="text-gray-600 mb-6">
        Customize your alerts for price changes and financial report updates. Choose between push notifications and email.
      </p>

      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {group.category}
            </h3>
            <div className="space-y-3">
              {group.items.map((item) => (
                <ToggleItem
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  checked={notifications[item.key]}
                  onChange={() => handleToggle(item.key)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-all hover:shadow-lg active:scale-95"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

const ToggleItem = ({ label, icon, checked, onChange }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-gray-600">{icon}</div>
        <label className="font-medium text-gray-800 cursor-pointer" onClick={onChange}>
          {label}
        </label>
      </div>
      <div className="relative inline-block w-12 h-6">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-light cursor-pointer transition-colors"></div>
        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md"></div>
      </div>
    </div>
  );
};

export default NotificationSettings;