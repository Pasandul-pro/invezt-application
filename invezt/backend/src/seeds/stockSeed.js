const Stock = require('../models/Stock');

const seedStocks = async () => {
  const stocks = [
    // Banking Sector
    { symbol: 'COMB.N0000', name: 'Commercial Bank of Ceylon', sector: 'Banking', industry: 'Banking' },
    { symbol: 'HNB.N0000', name: 'Hatton National Bank', sector: 'Banking', industry: 'Banking' },
    { symbol: 'SAMP.N0000', name: 'Sampath Bank', sector: 'Banking', industry: 'Banking' },
    { symbol: 'NTB.N0000', name: 'Nations Trust Bank', sector: 'Banking', industry: 'Banking' },
    { symbol: 'DFCC.N0000', name: 'DFCC Bank', sector: 'Banking', industry: 'Banking' },
    
    // Diversified Financials
    { symbol: 'LOLC.N0000', name: 'LOLC Holdings', sector: 'Diversified Financials', industry: 'Financial Services' },
    { symbol: 'CFIN.N0000', name: 'Central Finance', sector: 'Diversified Financials', industry: 'Leasing' },
    { symbol: 'LFIN.N0000', name: 'Lanka Finance', sector: 'Diversified Financials', industry: 'Financial Services' },
    
    // Conglomerate
    { symbol: 'JKH.N0000', name: 'John Keells Holdings', sector: 'Conglomerate', industry: 'Diversified' },
    { symbol: 'HHL.N0000', name: 'Hemas Holdings', sector: 'Conglomerate', industry: 'Diversified' },
    { symbol: 'RICH.N0000', name: 'Richmond Holdings', sector: 'Conglomerate', industry: 'Diversified' },
    
    // Telecom
    { symbol: 'DIAL.N0000', name: 'Dialog Axiata', sector: 'Telecom', industry: 'Telecommunications' },
    { symbol: 'SLT.N0000', name: 'Sri Lanka Telecom', sector: 'Telecom', industry: 'Telecommunications' },
    
    // Energy
    { symbol: 'LIOC.N0000', name: 'Lanka IOC', sector: 'Energy', industry: 'Oil & Gas' },
    { symbol: 'CHEV.N0000', name: 'Chevron Lubricants', sector: 'Energy', industry: 'Lubricants' },
    
    // Manufacturing
    { symbol: 'TKYO.N0000', name: 'Tokyo Cement', sector: 'Manufacturing', industry: 'Cement' },
    { symbol: 'LAMB.N0000', name: 'Lanka Milk Foods', sector: 'Manufacturing', industry: 'Food Processing' },
    
    // Healthcare
    { symbol: 'ASIR.N0000', name: 'Asiri Hospital', sector: 'Healthcare', industry: 'Healthcare' },
    { symbol: 'NHL.N0000', name: 'Nawaloka Hospital', sector: 'Healthcare', industry: 'Healthcare' }
  ];

  await Stock.deleteMany({});
  await Stock.insertMany(stocks);
  console.log('✅ Stocks seeded successfully');
  console.log(`📊 Total stocks added: ${stocks.length}`);
};

module.exports = seedStocks;