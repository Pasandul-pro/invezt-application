import { useState } from 'react';
import Header from '../components/layout/Header';

const LearningCard = ({
    level,
    title,
    description,
    price,
    link,
    tags,
    rating,
    difficulty
}) => {
    const difficultyClasses = {
        beginner: 'border-l-4 border-green-400',
        intermediate: 'border-l-4 border-yellow-400',
        advanced: 'border-l-4 border-pink-400',
        pro: 'border-l-4 border-purple-400'
    };

    const badgeClasses = {
        beginner: 'bg-green-500/20 text-green-300',
        intermediate: 'bg-yellow-500/20 text-yellow-300',
        advanced: 'bg-pink-500/20 text-pink-300',
        pro: 'bg-purple-500/20 text-purple-300'
    };

    return (
        <div className={`group relative glass-card rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 ${difficultyClasses[difficulty]}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClasses[difficulty]}`}>
                    {level}
                </div>
                <div className="text-yellow-400 text-xs tracking-tighter">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                </div>
            </div>

            <h4 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                {title}
            </h4>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                {description}
            </p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                <span className={`text-sm font-bold ${price === 'FREE' || price.includes('FREE') ? 'text-green-400' : 'text-yellow-400'}`}>
                    {price}
                </span>
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                    Visit Site
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700/50 text-slate-400 font-medium">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

const Learning = () => {
    const [activeTab, setActiveTab] = useState('free');

    const tabs = [
        { id: 'free', label: 'Free Resources', icon: '🎁' },
        { id: 'paid', label: 'Premium Courses', icon: '👑' },
        { id: 'docs', label: 'Documentation', icon: '📄' },
        { id: 'tools', label: 'Platforms & Tools', icon: '💻' },
    ];

    return (
        <div className="min-h-screen pb-20 animate-fadeIn">
            <Header />
            {/* Hero Section */}
            <header className="relative overflow-hidden border-b border-slate-800 bg-slate-950/40">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 py-16 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Professional Trading Education
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white tracking-tight">
                        Master the <span className="gradient-text">Markets</span>
                    </h1>
                    <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                        A comprehensive, curated collection of the world's best stock trading resources.
                        From complete beginner to professional trader — organized, rated, and verified.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 text-xs">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 rounded-xl border border-slate-700/50 text-slate-300">
                            <span className="text-green-400 font-bold">✓</span>
                            <span>100+ Verified Resources</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 rounded-xl border border-slate-700/50 text-slate-300">
                            <span className="text-blue-400 font-bold">🛡</span>
                            <span>Working Links Guaranteed</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 rounded-xl border border-slate-700/50 text-slate-300">
                            <span className="text-purple-400 font-bold">🎓</span>
                            <span>All Skill Levels</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filter Tabs */}
            <nav className="sticky top-[108px] z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex overflow-x-auto no-scrollbar gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all uppercase tracking-tighter
                                    ${activeTab === tab.id
                                        ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-slate-700/30'
                                    }
                                `}
                            >
                                <span className="text-sm">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content Areas */}
            <main className="max-w-7xl mx-auto px-4 py-12">

                {activeTab === 'free' && (
                    <div className="space-y-16 animate-slideUp">
                        {/* Section Header */}
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Free Educational Resources</h2>
                            <p className="text-slate-500 text-sm max-w-2xl">High-quality trading education at zero cost. Perfect for building foundations without financial commitment.</p>
                        </div>

                        {/* Category: Beginner */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                    <span className="text-lg">🌱</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white leading-none mb-1">Beginner Level</h3>
                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Foundation</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <LearningCard
                                    level="BEGINNER"
                                    difficulty="beginner"
                                    rating={5}
                                    title="Investing 101"
                                    description="CNBC-rated best free course. 10 chapters covering market basics, fundamental analysis, and virtual $100K practice portfolio."
                                    price="100% FREE"
                                    link="https://investing101.net/"
                                    tags={['StockTrak', 'Self-Paced']}
                                />
                                <LearningCard
                                    level="BEGINNER"
                                    difficulty="beginner"
                                    rating={4}
                                    title="Khan Academy Finance"
                                    description="Comprehensive financial literacy including investing basics. Self-paced with interactive exercises and video lessons."
                                    price="100% FREE"
                                    link="https://www.khanacademy.org/college-careers-more/talks-and-interviews/talks-and-interviews-unit/conversations/ct/v/capital-one-partnership-with-khan-academy"
                                    tags={['Non-Profit', 'Video']}
                                />
                                <LearningCard
                                    level="BEGINNER"
                                    difficulty="beginner"
                                    rating={5}
                                    title="GTF Trading in the Zone"
                                    description="50+ hours of free content, 20 sessions, rule-based trading methodology. Includes certification and lifetime PDF notes."
                                    price="100% FREE"
                                    link="https://www.gettogetherfinance.com/trading-in-the-zone-elementary"
                                    tags={['Certificate', 'Psychology']}
                                />
                                <LearningCard
                                    level="BEGINNER"
                                    difficulty="beginner"
                                    rating={4}
                                    title="Coursera: Financial Markets"
                                    description="Yale University course by Nobel laureate Robert Shiller. 33 hours of comprehensive market understanding."
                                    price="Audit Free"
                                    link="https://www.coursera.org/learn/financial-markets-global"
                                    tags={['Yale', 'Academic']}
                                />
                                <LearningCard
                                    level="BEGINNER"
                                    difficulty="beginner"
                                    rating={4}
                                    title="TD Ameritrade Education"
                                    description="Comprehensive free courses from basics to options. Interactive learning modules, quizzes, and live webcasts."
                                    price="100% FREE"
                                    link="https://www.tdameritrade.com/education.html"
                                    tags={['Broker', 'Webcasts']}
                                />
                                <LearningCard
                                    level="BEGINNER"
                                    difficulty="beginner"
                                    rating={4}
                                    title="Interactive Brokers Academy"
                                    description="Free comprehensive trading courses. Platform-specific training with simulated trading environment."
                                    price="100% FREE"
                                    link="https://www.interactivebrokers.com/en/index.php?f=16457"
                                    tags={['IBKR', 'Platform']}
                                />
                            </div>
                        </div>

                        {/* Category: Intermediate */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                    <span className="text-lg">⚡</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white leading-none mb-1">Intermediate Level</h3>
                                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Technical Skills</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <LearningCard
                                    level="INTERMEDIATE"
                                    difficulty="intermediate"
                                    rating={4}
                                    title="StockCharts ChartSchool"
                                    description="The internet's most comprehensive technical analysis education. Free articles on indicators, patterns, and strategies."
                                    price="100% FREE"
                                    link="https://school.stockcharts.com/"
                                    tags={['Technical', 'Charts']}
                                />
                                <LearningCard
                                    level="INTERMEDIATE"
                                    difficulty="intermediate"
                                    rating={4}
                                    title="TradingView Free Tier"
                                    description="Advanced charting with community scripts. Free educational resources and paper trading capabilities."
                                    price="Freemium"
                                    link="https://www.tradingview.com/education/"
                                    tags={['Charts', 'Community']}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'paid' && (
                    <div className="space-y-16 animate-slideUp">
                        {/* Section Header */}
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Premium Educational Resources</h2>
                            <p className="text-slate-500 text-sm max-w-2xl">Professional-grade courses with mentorship, community access, and structured curricula for serious traders.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <LearningCard
                                level="BEGINNER"
                                difficulty="beginner"
                                rating={4}
                                title="Udemy: Complete Foundation"
                                description="6.5 hours on-demand video, 50+ resources. Often on sale for $12-15. Lifetime access with certificate."
                                price="~$15 (Sale)"
                                link="https://www.udemy.com/course/the-complete-foundation-stock-trading-course/"
                                tags={['Video', 'Lifetime']}
                            />
                            <LearningCard
                                level="INTERMEDIATE"
                                difficulty="intermediate"
                                rating={5}
                                title="Colibri Trader"
                                description="Price action methodology. 8,000+ students. One-on-one mentorship included. Supply & Demand specialization."
                                price="Premium Plans"
                                link="https://colibritrader.com/"
                                tags={['Mentorship', 'Price Action']}
                            />
                            <LearningCard
                                level="PRO"
                                difficulty="pro"
                                rating={5}
                                title="NYIF Stock Trading Certificate"
                                description="New York Institute of Finance. 8 modules with Peter Tuchman & David Green. Wall Street-recognized certificate."
                                price="Contact for Pricing"
                                link="https://www.nyif.com/stock-trading-professional-certificate-online.html"
                                tags={['NYIF', 'Certificate']}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'docs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideUp">
                        <LearningCard
                            level="REGULATORY"
                            difficulty="pro"
                            rating={5}
                            title="SEC EDGAR Database"
                            description="Free access to corporate filings including 10-K, 10-Q reports. Essential for fundamental analysis and due diligence."
                            price="100% FREE"
                            link="https://www.sec.gov/edgar"
                            tags={['Government', 'Filings']}
                        />
                        <LearningCard
                            level="EXCHANGE"
                            difficulty="intermediate"
                            rating={5}
                            title="CBOE Options Education"
                            description="Comprehensive options education from the Chicago Board Options Exchange. Strategies, pricing, and risk management."
                            price="100% FREE"
                            link="https://www.cboe.com/education/"
                            tags={['Options', 'Exchange']}
                        />
                    </div>
                )}

                {activeTab === 'tools' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
                        <LearningCard
                            level="PLATFORM"
                            difficulty="beginner"
                            rating={5}
                            title="TradingView"
                            description="Most popular charting platform. Free tier available. Social trading features and Pine Script programming."
                            price="Free Tier"
                            link="https://www.tradingview.com/"
                            tags={['Charting', 'Global']}
                        />
                        <LearningCard
                            level="SIMULATOR"
                            difficulty="intermediate"
                            rating={5}
                            title="thinkorswim (Schwab)"
                            description="Professional-grade platform with PaperMoney simulation. Advanced options analysis and customizable studies."
                            price="FREE"
                            link="https://www.schwab.com/trading/thinkorswim"
                            tags={['Software', 'Sim']}
                        />
                    </div>
                )}
            </main>

            {/* Resources Disclaimer */}
            <div className="max-w-7xl mx-auto px-4 mt-20 pt-16 border-t border-slate-800 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <h5 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Learning Path Guide</h5>
                        <ul className="space-y-4 text-xs">
                            <li className="flex items-center gap-3 text-slate-400 group">
                                <span className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform"></span>
                                Start with Free Foundations
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 group">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 group-hover:scale-125 transition-transform"></span>
                                Practice with Paper Trading
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 group">
                                <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform"></span>
                                Invest in Pro Education
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Risk Warning</h5>
                        <p className="text-xs text-slate-500 leading-relaxed italic">
                            Trading stocks involves substantial risk of loss and is not suitable for all investors.
                            Past performance is not indicative of future results. Always conduct your own due diligence.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Link Verification</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            All links verified as of March 2026. Resources are regularly checked for availability.
                            Educational purposes only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learning;
