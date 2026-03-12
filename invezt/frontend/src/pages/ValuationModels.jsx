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
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-12 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Valuation Models Reference</h1>
          <p className="text-lg opacity-90">Learn about different stock valuation methods and financial ratios</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, index) => (
            <div key={index} className="card hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold text-primary mb-4">{model.title}</h3>
              
              <div className="bg-gray-50 border-l-4 border-primary-light p-4 rounded-lg mb-4 font-mono text-sm">
                {model.formula}
              </div>
              
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{model.description}</p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <strong className="text-sm font-semibold text-gray-800 block mb-3">Key Components:</strong>
                <ul className="space-y-2">
                  {model.components.map((comp, idx) => (
                    <li key={idx} className="text-sm">
                      <strong className="text-primary">{comp.label}:</strong>{' '}
                      <span className="text-gray-700">{comp.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {model.link && (
                <Link to={model.link} className="btn btn-primary w-full text-center">
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