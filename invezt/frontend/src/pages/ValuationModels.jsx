import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';

const ValuationModels = () => {
  const models = [
    {
      title: 'CAPM (Capital Asset Pricing Model)',
      formula: 'ER = Rf + β(ERm - Rf)',
      description: 'Used to determine the expected return on an investment given its risk relative to the market.',
      components: [
        { label: 'Rf', desc: 'Risk-free rate (Sri Lanka T-bills)' },
        { label: 'β', desc: 'Beta (stock volatility vs CSE)' },
        { label: 'ERm', desc: 'Expected CSE market return' },
      ],
      link: '/analyzer',
      linkText: 'Try CAPM Calculator',
    },
    {
      title: 'DCF (Discounted Cash Flow)',
      formula: 'Value = Σ [CFt / (1 + r)^t]',
      description: 'Values a company based on its projected future cash flows discounted to present value.',
      components: [
        { label: 'CFt', desc: 'Cash flow in period t' },
        { label: 'r', desc: 'Discount rate' },
        { label: 't', desc: 'Time period' },
      ],
      link: '/analyzer',
      linkText: 'Try DCF Calculator',
    },
    {
      title: 'P/E Ratio (Price to Earnings)',
      formula: 'P/E = Stock Price / EPS',
      description: 'Measures how much investors are willing to pay per dollar of earnings.',
      components: [
        { label: 'High P/E', desc: 'Growth expectations' },
        { label: 'Low P/E', desc: 'Value opportunity' },
        { label: 'Compare', desc: 'Industry peers' },
      ],
      link: '/compare',
      linkText: 'Compare P/E Ratios',
    },
    {
      title: 'PEG Ratio (P/E to Growth)',
      formula: 'PEG = P/E Ratio / Earnings Growth Rate',
      description: 'Refines P/E ratio by considering earnings growth expectations.',
      components: [
        { label: 'PEG < 1', desc: 'Potentially undervalued' },
        { label: 'PEG > 1', desc: 'Potentially overvalued' },
        { label: 'PEG = 1', desc: 'Fairly valued' },
      ],
    },
    {
      title: 'ROE (Return on Equity)',
      formula: 'ROE = Net Income / Shareholders\' Equity',
      description: 'Measures how effectively a company uses shareholders\' money to generate profits.',
      components: [
        { label: '>15%', desc: 'Excellent' },
        { label: '8-15%', desc: 'Good' },
        { label: '<8%', desc: 'Poor' },
      ],
    },
    {
      title: 'EPS (Earnings Per Share)',
      formula: 'EPS = (Net Income - Dividends) / Outstanding Shares',
      description: 'Shows how much profit is allocated to each share of common stock.',
      components: [
        { label: 'YoY Growth', desc: 'Compare year over year' },
        { label: 'Industry', desc: 'Compare to industry' },
        { label: 'Consistency', desc: 'Watch for consistency' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 animate-fadeIn">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="premium-gradient p-12 rounded-3xl text-center mb-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">Valuation Models Reference</h1>
          <p className="text-lg text-blue-100/90 font-medium max-w-2xl mx-auto">Master the key stock valuation methods and financial ratios used by professional analysts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model, index) => (
            <div key={index} className="glass-card p-8 rounded-3xl flex flex-col hover:scale-[1.02] hover:glow-blue transition-all duration-500 animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-white leading-tight">{model.title}</h3>
                <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">📐</span>
              </div>
              
              <div className="bg-slate-900/80 border border-blue-500/20 p-5 rounded-2xl mb-6 font-mono text-sm text-blue-400 text-center shadow-inner group-hover:border-blue-500/40 transition-colors">
                {model.formula}
              </div>
              
              <p className="text-slate-400 mb-6 text-sm leading-relaxed flex-grow">{model.description}</p>
              
              <div className="bg-white/5 rounded-2xl p-5 mb-8 border border-white/5 transition-colors hover:bg-white/[0.07]">
                <strong className="text-[10px] font-black uppercase tracking-widest text-blue-500 block mb-4">Key Components</strong>
                <ul className="space-y-3">
                  {model.components.map((comp, idx) => (
                    <li key={idx} className="text-xs flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                      <div>
                        <span className="font-bold text-slate-200 mr-2">{comp.label}:</span>
                        <span className="text-slate-400">{comp.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {model.link && (
                <Link to={model.link} className="btn btn-primary w-full text-center py-4 rounded-xl shadow-lg shadow-blue-600/10 group-hover:shadow-blue-600/20">
                  {model.linkText}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ValuationModels;