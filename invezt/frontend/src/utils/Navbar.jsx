const Navbar = ({ activeSection, setActiveSection, activeSubTab, setActiveSubTab }) => {
    const newsSubTabs = [
        { id: 'search', label: 'Latest News', icon: '📰' },
        { id: 'resources', label: 'External Resources', icon: '🔗' },
    ];

    const mainSections = [
        { id: 'news', label: 'News' },
        { id: 'learning', label: 'Learning' },
        { id: 'analytics', label: 'Analytics' }, 
    ];

    return (
        <div className="sticky top-0 z-50 flex flex-col">
            {/* Level 1: Main Application Navbar */}
            <nav className="glass bg-slate-900/95 border-b border-slate-800/50 backdrop-blur-md shadow-lg shadow-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-3 shrink-0 cursor-pointer group"
                            onClick={() => {
                                setActiveSection('news');
                                setActiveSubTab('search');
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="text-lg font-black gradient-text tracking-tighter">
                                Invezt
                            </span>
                        </div>

                        {/* Top Level Nav */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            {mainSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`
                                        relative text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg transition-all duration-300
                                        ${activeSection === section.id
                                            ? 'text-white bg-white/5'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {section.label}
                                    {activeSection === section.id && (
                                        <div className="absolute bottom-1 left-3 right-3 h-0.5 bg-blue-500 rounded-full animate-fadeIn"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Right side placeholder */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-bold hover:border-slate-500 transition-colors cursor-pointer">
                                JP
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Level 2: Sub-Navbar (Only for News currently) */}
            {activeSection === 'news' && (
                <nav className="bg-slate-950/80 border-b border-white/5 backdrop-blur-sm animate-slideDown">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center h-10 space-x-1">
                            {newsSubTabs.map((tab) => {
                                const isActive = activeSubTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveSubTab(tab.id)}
                                        className={`
                                            group relative px-4 h-full flex items-center gap-2 text-[10px] font-bold transition-all duration-200 uppercase tracking-wider
                                            ${isActive
                                                ? 'text-blue-400'
                                                : 'text-slate-500 hover:text-slate-300'
                                            }
                                        `}
                                    >
                                        <span className={`text-xs ${isActive ? 'scale-110' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100'} transition-all`}>
                                            {tab.icon}
                                        </span>
                                        <span className="tracking-widest">{tab.label}</span>

                                        {isActive && (
                                            <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </nav>
            )}
        </div>
    );
};

export default Navbar;
