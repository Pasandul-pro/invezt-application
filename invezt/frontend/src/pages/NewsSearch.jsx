import { useState } from 'react';
import { searchNews } from '../api/newsApi';
import NewsCard from '../components/news/NewsCard';
import SearchBar from '../utils/SearchBar';

const NewsSearch = () => {
    const [query, setQuery] = useState('');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const data = await searchNews(query);
            if (data.status === 'error') {
                throw new Error(data.message || 'Failed to fetch news');
            }
            setArticles(data.articles || []);
        } catch (err) {
            setError(err.message || 'Something went wrong while fetching news');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-20 transition-colors duration-500">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-6">
                        News Pulse
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Stay informed with real-time news search powered by Gemini AI and global reporting.
                    </p>
                </header>

                <SearchBar
                    query={query}
                    setQuery={setQuery}
                    onSearch={handleSearch}
                    loading={loading}
                />

                {error && (
                    <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center animate-shake">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="mt-12">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl h-96 shadow-md border border-slate-100 dark:border-slate-700"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {articles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                                    {articles.map((article, index) => (
                                        <NewsCard key={index} article={article} />
                                    ))}
                                </div>
                            ) : hasSearched ? (
                                <div className="text-center py-20 opacity-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-2xl font-medium text-slate-600 dark:text-slate-400">No results found for "{query}"</p>
                                </div>
                            ) : (
                                <div className="text-center py-20 opacity-50">
                                    <p className="text-3xl font-light text-slate-400">Start exploring the world...</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsSearch;
