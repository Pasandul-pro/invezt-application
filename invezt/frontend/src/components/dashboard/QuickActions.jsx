import { Link } from 'react-router-dom';
import { BarChart3, GitCompare, Briefcase, BookOpen, FileText } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: 'Analyze Stock',
      description: 'Search and analyze any Sri Lankan stock',
      link: '/analyzer',
      icon: <BarChart3 className="w-10 h-10" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Compare Companies',
      description: 'Compare up to 3 Sri Lankan companies',
      link: '/compare',
      icon: <GitCompare className="w-10 h-10" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Create Portfolio',
      description: 'Build and track your portfolio',
      link: '/portfolio',
      icon: <Briefcase className="w-10 h-10" />,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Valuation Models',
      description: 'Learn about CAPM, DCF, and other models',
      link: '/valuation-models',
      icon: <BookOpen className="w-10 h-10" />,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Company Reports',
      description: 'Valuate your company through your report',
      link: '/company-report',
      icon: <FileText className="w-10 h-10" />,
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group bg-white rounded-xl shadow-md p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className={`bg-gradient-to-br ${action.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-primary-light transition-colors">
              {action.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;