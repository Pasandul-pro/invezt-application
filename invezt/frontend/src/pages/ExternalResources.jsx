import { useCallback, useState } from 'react';

const resourceCategories = [
    {
        id: 'macro',
        icon: '📊',
        title: 'Macroeconomic Analysis',
        subtitle: 'Economic factors & indicators',
        color: 'from-blue-500 to-indigo-500',
        links: [
            { title: 'Central Bank of Sri Lanka', description: 'Monetary policy, inflation, interest rates & official reports', url: 'https://www.cbsl.gov.lk/en', tag: 'Sri Lanka' },
            { title: 'CBSL Socio-Economic Data', description: 'Annual economic statistics & publications', url: 'https://www.cbsl.gov.lk/en/publications/other-publications/statistical-publications/sri-lanka-socio-economic-data-folder', tag: 'Sri Lanka' },
            { title: 'Dept. of Census & Statistics', description: 'GDP, inflation, price indexes & demographic data', url: 'https://www.statistics.gov.lk/en', tag: 'Sri Lanka' },
            { title: 'IMF Data Portal', description: 'World Economic Outlook & global financial statistics', url: 'https://data.imf.org/', tag: 'Global' },
            { title: 'World Bank Open Data', description: 'Global economic indicators – GDP, trade, debt, population', url: 'https://data.worldbank.org/', tag: 'Global' },
        ]
    },
    {
        id: 'markets',
        icon: '📈',
        title: 'Market Index & Exchanges',
        subtitle: 'Stock market data & indices',
        color: 'from-emerald-500 to-teal-500',
        links: [
            { title: 'Colombo Stock Exchange', description: 'ASPI, SL20, company quotes & announcements', url: 'https://www.cse.lk/', tag: 'Sri Lanka' },
            { title: 'NYSE – New York Stock Exchange', description: 'Official NYSE market data & listings', url: 'https://www.nyse.com/', tag: 'Global' },
            { title: 'NASDAQ', description: 'US tech & market data, listings & news', url: 'https://www.nasdaq.com/', tag: 'Global' },
            { title: 'S&P 500 – Yahoo Finance', description: 'S&P 500 index overview, charts & analysis', url: 'https://finance.yahoo.com/quote/%5EGSPC', tag: 'Global' },
        ]
    },
    {
        id: 'fundamental',
        icon: '📊',
        title: 'Fundamental & Company Analysis',
        subtitle: 'Financial data, earnings & ratios',
        color: 'from-violet-500 to-purple-500',
        links: [
            { title: 'Yahoo Finance', description: 'Company financials, quotes, earnings & analysis', url: 'https://finance.yahoo.com/', tag: 'Global' },
            { title: 'Financial Times Markets', description: 'Fundamentals, quotes & market data from FT', url: 'https://markets.ft.com/data', tag: 'Global' },
        ]
    },
    {
        id: 'technical',
        icon: '📉',
        title: 'Technical Analysis & Tools',
        subtitle: 'Charting platforms & indicators',
        color: 'from-orange-500 to-amber-500',
        links: [
            { title: 'TradingView', description: 'Advanced charts, indicators & community analysis', url: 'https://www.tradingview.com/', tag: 'Global' },
            { title: 'Investing.com', description: 'Market news, charts, analysis & financial tools', url: 'https://www.investing.com/', tag: 'Global' },
        ]
    },
    {
        id: 'sector-sl',
        icon: '�🇰',
        title: 'Sri Lanka – Sector & Industry Data',
        subtitle: 'CSE sector performance & industry breakdowns',
        color: 'from-cyan-500 to-blue-500',
        links: [
            { title: 'TradingView – Sri Lanka Sectors Overview', description: 'Sectors performance metrics, market cap, dividend yield & volume for CSE-listed companies', url: 'https://www.tradingview.com/markets/stocks-sri-lanka/sectorandindustry-sector/', tag: 'Sri Lanka' },
            { title: 'TradingView – Sri Lanka Industries Breakdown', description: 'Industry-level performance & grouping (banks, retail, consumer goods)', url: 'https://www.tradingview.com/markets/stocks-sri-lanka/sectorandindustry-industry/', tag: 'Sri Lanka' },
        ]
    },
    {
        id: 'sector-global',
        icon: '🌍',
        title: 'Global Sector & Industry Classification',
        subtitle: 'Standards, interactive tools & educational guides',
        color: 'from-teal-500 to-emerald-500',
        links: [
            { title: 'GICS® – Global Industry Classification Standard', description: 'Official global taxonomy used by financial markets to classify companies', url: 'https://www.msci.com/indexes/index-resources/gics', tag: 'Global' },
            { title: 'GICS – Wikipedia Overview', description: 'Free overview of how GICS works worldwide', url: 'https://en.wikipedia.org/wiki/Global_Industry_Classification_Standard', tag: 'Global' },
            { title: 'ICB – Industry Classification Benchmark', description: 'Alternative global industry taxonomy used by many exchanges', url: 'https://en.wikipedia.org/wiki/Industry_Classification_Benchmark', tag: 'Global' },
            { title: 'Yahoo Finance – Sector Performance', description: 'Sector performance charts with drill-down into industry returns & trends', url: 'https://finance.yahoo.com/sectors/', tag: 'Global' },
            { title: 'Barchart – Sector Finder', description: 'Enter any ticker to find its sector & industry classification', url: 'https://www.barchart.com/stocks/sectors/rankings', tag: 'Global' },
            { title: 'Schwab – What Are Stock Sectors?', description: 'Explanation of global stock sectors & how investors use them', url: 'https://www.schwab.com/learn/story/what-are-stock-sectors', tag: 'Global' },
            { title: 'Bankrate – Global Market Sector Guide', description: 'Overview of the official 11 GICS sectors and their role', url: 'https://www.bankrate.com/investing/stock-market-sectors-guide/', tag: 'Global' },
        ]
    },
    {
        id: 'regulatory',
        icon: '📜',
        title: 'Political, Policy & Regulatory',
        subtitle: 'Legal & regulatory information',
        color: 'from-rose-500 to-pink-500',
        links: [
            { title: 'Central Bank of Sri Lanka', description: 'Monetary policy decisions, press releases & regulations', url: 'https://www.cbsl.gov.lk/en', tag: 'Regulatory' },
            { title: 'Dept. of Census & Statistics', description: 'Government economic data, employment & inflation stats', url: 'https://www.statistics.gov.lk/en', tag: 'Regulatory' },
        ]
    },
];

import Header from '../components/layout/Header';

const ExternalResources = () => {
    const [openUrls, setOpenUrls] = useState(new Set());

    const openPopupWindow = useCallback((url, title) => {
        // Calculate popup size – roughly the same size as the main window
        const width = Math.min(window.innerWidth - 100, 1200);
        const height = Math.min(window.innerHeight - 80, 800);
        const left = window.screenX + 50 + (openUrls.size % 5) * 30;
        const top = window.screenY + 40 + (openUrls.size % 5) * 30;

        const features = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            'menubar=no',
            'toolbar=yes',
            'location=yes',
            'status=yes',
            'resizable=yes',
            'scrollbars=yes',
        ].join(',');

        const popupWindow = window.open(url, `popup_${title.replace(/\s/g, '_')}`, features);

        if (popupWindow) {
            setOpenUrls(prev => new Set([...prev, url]));

            // Monitor when the popup closes
            const checkClosed = setInterval(() => {
                if (popupWindow.closed) {
                    clearInterval(checkClosed);
                    setOpenUrls(prev => {
                        const next = new Set(prev);
                        next.delete(url);
                        return next;
                    });
                }
            }, 1000);
        } else {
            // Popup was blocked – fall back to new tab
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, [openUrls]);

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 animate-fadeIn">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <span className="text-sm">🔗</span>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Curated Sources</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                        External Resources for Better<br />
                        <span className="gradient-text">Decision Making</span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
                        Access trusted financial data sources, market analysis tools, and economic indicators.
                        Click any link to open it as a separate popup window.
                    </p>
                </div>

                {/* Open windows indicator */}
                {openUrls.size > 0 && (
                    <div className="flex items-center justify-center gap-3 mb-8 animate-slideDown">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-xs font-semibold text-slate-300">
                                {openUrls.size} popup window{openUrls.size > 1 ? 's' : ''} open
                            </span>
                        </div>
                    </div>
                )}

                {/* Resource Grid – 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {resourceCategories.map((category) => (
                        <div
                            key={category.id}
                            className="glass-card rounded-2xl overflow-hidden hover:glow-border transition-all duration-300"
                        >
                            {/* Category Header */}
                            <div className="px-6 py-4 border-b border-slate-700/30 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg text-lg`}>
                                    {category.icon}
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">{category.title}</h2>
                                    <p className="text-xs text-slate-400">{category.subtitle}</p>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="p-4 space-y-2">
                                {category.links.map((link, idx) => {
                                    const isOpen = openUrls.has(link.url);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => openPopupWindow(link.url, link.title)}
                                            className={`w-full text-left group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${isOpen
                                                ? 'bg-blue-600/15 border border-blue-500/20'
                                                : 'hover:bg-slate-700/40'
                                                }`}
                                        >
                                            <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-blue-600/30' : 'bg-slate-700/60 group-hover:bg-blue-600/20'
                                                }`}>
                                                {isOpen ? (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                                                        {link.title}
                                                    </span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${link.tag === 'Global'
                                                        ? 'bg-cyan-500/15 text-cyan-400'
                                                        : link.tag === 'Regulatory'
                                                            ? 'bg-rose-500/15 text-rose-400'
                                                            : 'bg-emerald-500/15 text-emerald-400'
                                                        }`}>
                                                        {link.tag}
                                                    </span>
                                                    {isOpen && (
                                                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider shrink-0">• Open</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors line-clamp-1">
                                                    {link.description}
                                                </p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600 group-hover:text-blue-400 mt-1 shrink-0 transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-10 text-center">
                    <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                        💡 Each link opens as a separate browser popup window that you can
                        drag, resize, and arrange alongside this page – like multi-window on your phone.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExternalResources;
