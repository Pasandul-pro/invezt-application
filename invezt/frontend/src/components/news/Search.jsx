import { useState } from 'react';
import { searchNews, summarizeArticle } from '../../api/newsApi';

// --- Sub-component: SearchBar ---
const SearchBar = ({ query, setQuery, sortBy, setSortBy, language, setLanguage, onSearch, loading }) => {
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'Arabic' },
        { code: 'de', name: 'German' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'he', name: 'Hebrew' },
        { code: 'it', name: 'Italian' },
        { code: 'nl', name: 'Dutch' },
        { code: 'no', name: 'Norwegian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'sv', name: 'Swedish' },
        { code: 'zh', name: 'Chinese' },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mb-10 space-y-5">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                <div className="relative flex items-center glass-card rounded-xl overflow-hidden">
                    <div className="pl-5 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                        placeholder="Search global news, markets, trends..."
                        className="w-full px-4 py-4 bg-transparent border-none focus:ring-0 text-white text-base placeholder-slate-500 outline-none"
                    />
                    <button
                        onClick={() => onSearch()}
                        disabled={loading}
                        className="mr-3 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-blue-500/20 text-sm"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Search'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            if (query.trim()) {
                                setTimeout(() => onSearch(e.target.value, language), 0);
                            }
                        }}
                        className="glass-card text-slate-200 text-sm rounded-lg focus:ring-1 focus:ring-blue-500/50 px-3 py-2 transition-all outline-none cursor-pointer hover:border-blue-400/30 bg-transparent border border-slate-700/50"
                    >
                        <option value="publishedAt" className="bg-slate-900">Newest First</option>
                        <option value="popularity" className="bg-slate-900">Popularity</option>
                        <option value="relevancy" className="bg-slate-900">Relevancy</option>
                    </select>
                </div>

                <div className="w-px h-5 bg-slate-700/50 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language:</label>
                    <select
                        value={language}
                        onChange={(e) => {
                            setLanguage(e.target.value);
                            if (query.trim()) {
                                setTimeout(() => onSearch(sortBy, e.target.value), 0);
                            }
                        }}
                        className="glass-card text-slate-200 text-sm rounded-lg focus:ring-1 focus:ring-blue-500/50 px-3 py-2 transition-all outline-none cursor-pointer hover:border-blue-400/30 bg-transparent border border-slate-700/50"
                    >
                        {languages.map((lang) => (
                            <option key={lang.code} value={lang.code} className="bg-slate-900">
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: NewsCard ---
const NewsCard = ({ article }) => {
    const { title, description, urlToImage, url, source, publishedAt, content } = article;
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleSummarize = async () => {
        if (summary) {
            setShowSummary(!showSummary);
            return;
        }

        setIsSummarizing(true);
        setError(null);
        try {
            const textToSummarize = content || description || title;
            const result = await summarizeArticle(textToSummarize);
            setSummary(result.summary);
            setShowSummary(true);
        } catch (err) {
            if (err.response?.data?.error?.includes('429') || err.response?.data?.error?.includes('RESOURCE_EXHAUSTED')) {
                setError('AI Rate Limit Reached. Please wait a minute and try again.');
            } else {
                setError('Could not generate summary.');
            }
            console.error(err);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="group flex flex-col glass-card rounded-2xl overflow-hidden hover:glow-border hover:glow-blue transition-all duration-300 hover:-translate-y-1">
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-lg">
                        {source?.name || 'News'}
                    </span>
                </div>

                {/* AI Summarize Button */}
                <button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="absolute bottom-3 right-3 p-2 bg-slate-900/80 backdrop-blur-md rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all z-10 group/btn border border-slate-700/50 hover:border-blue-500/50"
                    title="Summarize with AI"
                >
                    {isSummarizing ? (
                        <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 group-hover/btn:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="text-slate-500 text-xs mb-2 flex items-center font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(publishedAt)}
                </div>
                <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
                    {title}
                </h3>

                {showSummary ? (
                    <div className="mb-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 animate-fadeIn overflow-hidden">
                        <div className="flex items-center mb-1.5">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-1 rounded-md mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">AI Summary</span>
                            <button
                                onClick={() => setShowSummary(false)}
                                className="ml-auto text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed font-medium">
                            {summary}
                        </p>
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                        {description || "No description available for this article."}
                    </p>
                )}

                {error && <p className="text-red-400 text-[10px] font-bold mt-1 mb-2 animate-pulse">{error}</p>}

                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto flex items-center justify-center py-2.5 px-4 bg-slate-700/40 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 text-slate-300 hover:text-white font-semibold rounded-xl transition-all active:scale-95 text-sm border border-slate-700/30 hover:border-transparent"
                >
                    Read Full Article
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

// --- Main Component: Search ---
const Search = () => {
    const [query, setQuery] = useState('');
    const [sortBy, setSortBy] = useState('publishedAt');
    const [language, setLanguage] = useState('en');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (overrideSort, overrideLang) => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const data = await searchNews({
                q: query,
                sortBy: overrideSort || sortBy,
                language: overrideLang || language
            });
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
        <div className="min-h-screen px-4 py-10 animate-fadeIn">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">AI-Powered News Search</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                        Discover What's <span className="gradient-text">Happening Now</span>
                    </h1>
                    <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Search and analyze global news with AI-powered summaries, real-time results, and multi-language support.
                    </p>
                </header>

                <SearchBar
                    query={query}
                    setQuery={setQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    language={language}
                    setLanguage={setLanguage}
                    onSearch={handleSearch}
                    loading={loading}
                />

                {error && (
                    <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center animate-shake">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-semibold text-sm">{error}</span>
                    </div>
                )}

                <div className="mt-12">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse glass-card rounded-2xl h-[400px]"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {articles.length > 0 ? (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-sm text-slate-400">
                                            Found <span className="text-white font-bold">{articles.length}</span> articles for "<span className="text-blue-400">{query}</span>"
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                                        {articles.map((article, index) => (
                                            <NewsCard key={index} article={article} />
                                        ))}
                                    </div>
                                </>
                            ) : hasSearched ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
                                    <p className="text-slate-500 text-sm">Try adjusting your search for "<span className="text-blue-400">{query}</span>"</p>
                                </div>
                            ) : (
                                <div className="text-center py-24">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto opacity-10 mb-10">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-32 bg-slate-700 rounded-2xl"></div>
                                        ))}
                                    </div>
                                    <p className="text-xl font-light text-slate-500 tracking-wide">
                                        Enter a topic above to begin exploring...
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
