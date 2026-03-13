
const SearchBar = ({ query, setQuery, onSearch, loading }) => {
    return (
        <div className="relative w-full max-w-2xl mx-auto mb-10 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl">
                <div className="pl-5 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    placeholder="Search for latest news..."
                    className="w-full px-4 py-5 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white text-lg placeholder-slate-400 outline-none"
                />
                <button
                    onClick={onSearch}
                    disabled={loading}
                    className="mr-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
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
    );
};

export default SearchBar;
