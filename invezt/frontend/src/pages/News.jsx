import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { searchNews } from '../api/newsApi.js';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('Colombo Stock Exchange CSE Sri Lanka');
  const [inputQuery, setInputQuery] = useState('');

  useEffect(() => {
    loadNews(searchQuery);
  }, [searchQuery]);

  const loadNews = async (query) => {
    setLoading(true);
    setError('');
    try {
      const data = await searchNews({ q: query, sortBy: 'publishedAt', language: 'en' });
      setArticles(data.articles || []);
    } catch (err) {
      setError('Could not load news. Please try again.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchQuery(inputQuery.trim());
      setInputQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-12 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Latest Market News</h1>
          <p className="text-lg opacity-90">Real-time market news from CSE and Sri Lanka financial markets</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="card mb-8 flex gap-4">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Search news (e.g. JKH, CSE, banking sector)..."
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary">Search</button>
          <button
            type="button"
            onClick={() => setSearchQuery('Colombo Stock Exchange CSE Sri Lanka')}
            className="btn bg-gray-500 text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </form>

        {/* News articles */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading news...</div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-8 text-red-700">{error}</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No articles found for "{searchQuery}".</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 12).map((article, idx) => (
              <div key={idx} className="card hover:scale-105 transition-transform flex flex-col">
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2">{article.title}</h3>
                <div className="bg-gray-50 border-l-4 border-primary-light px-3 py-1 rounded mb-3">
                  <span className="text-xs text-gray-600 font-mono">
                    {article.source?.name} · {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
                  {article.description || 'No description available.'}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-sm text-center mt-auto"
                >
                  Read More
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;