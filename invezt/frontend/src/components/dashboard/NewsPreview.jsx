import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';

const NewsPreview = () => {
  const newsItems = [
    {
      title: 'Latest News',
      description: 'John Keells Holdings reports strong quarterly earnings with 25% growth in profits...',
      link: '/news',
    },
    {
      title: 'CSE Market Update',
      description: 'Colombo Stock Exchange shows positive momentum with banking and manufacturing sectors leading gains.',
      link: '/news',
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {newsItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Newspaper className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          </div>
          <Link
            to={item.link}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors group"
          >
            <span>Read More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default NewsPreview;