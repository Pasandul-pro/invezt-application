import { Calendar, ArrowRight } from 'lucide-react';

const NewsCard = ({ news }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <h3 className="text-xl font-semibold text-primary mb-3 leading-tight">
        {news.title}
      </h3>
      
      <div className="flex items-center gap-2 bg-gray-50 border-l-4 border-primary-light px-4 py-3 rounded-lg mb-4">
        <Calendar className="w-4 h-4 text-gray-600" />
        <span className="font-mono font-bold text-sm text-gray-700">
          {news.date}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
        {news.summary}
      </p>
      
      <button className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-light transition-colors group">
        <span>Read More</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default NewsCard;