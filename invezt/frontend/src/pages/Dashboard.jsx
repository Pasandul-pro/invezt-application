import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { BarChart3, GitCompare, Briefcase, BookOpen, FileText } from 'lucide-react';

const Dashboard = () => {
  const quickActions = [
    { title: 'Analyze Stock', description: 'Search and analyze any Sri Lankan stock', link: '/analyzer', icon: <BarChart3 className="w-8 h-8" /> },
    { title: 'Compare Companies', description: 'Compare up to 3 Sri Lankan companies', link: '/compare', icon: <GitCompare className="w-8 h-8" /> },
    { title: 'Create Portfolio', description: 'Build and track your portfolio', link: '/portfolio', icon: <Briefcase className="w-8 h-8" /> },
    { title: 'Valuation Models', description: 'Learn about CAPM, DCF, and other models', link: '/valuation-models', icon: <BookOpen className="w-8 h-8" /> },
    { title: 'Company Reports Valuation', description: 'Valuate your company through your report', link: '/company-report', icon: <FileText className="w-8 h-8" /> },
  ];

  const marketHighlights = [
    { name: 'ASPI', value: '+1.2%', positive: true },
    { name: 'S&P SL20', value: '+0.8%', positive: true },
    { name: 'LKR/USD', value: '322.50', positive: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-12 text-center mb-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-lg opacity-90">Track, analyze, and manage your investments in Sri Lankan stocks</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="card text-center hover:scale-105 transition-transform">
              <div className="flex justify-center text-primary mb-4">{action.icon}</div>
              <h3 className="text-lg font-semibold text-primary mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Market Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {marketHighlights.map((item, index) => (
            <div key={index} className="card text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
              <p className={`text-2xl font-bold ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-primary mb-4">Latest News</h3>
            <p className="text-gray-600 mb-4">John Keells Holdings reports strong quarterly earnings...</p>
            <Link to="/news" className="btn btn-primary">View All News & Notifications</Link>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-primary mb-4">CSE Market Update</h3>
            <p className="text-gray-600 mb-4">
              Colombo Stock Exchange shows positive momentum with banking and manufacturing sectors leading gains.
            </p>
            <Link to="/news" className="btn btn-primary">Read More</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;