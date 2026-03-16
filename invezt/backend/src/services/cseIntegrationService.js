import axios from 'axios';
import FinancialDocument from '../models/financialDocumentModel.js';
import Stock from '../models/Stock.js';
import calculationService from './calculationService.js';

class CSEIntegrationService {
  constructor() {
    this.baseURL = 'https://www.cse.lk/api/';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'invezt-app',
        'Accept': 'application/json'
      }
    });
  }

  // Poll for new financial announcements every 1 HOUR
  startPolling() {
    console.log('🔄 Starting CSE announcement polling every 1 hour...');
    // Run immediately on start, then every 1 hour
    this.checkForNewAnnouncements();
    setInterval(async () => {
      await this.checkForNewAnnouncements();
    }, 60 * 60 * 1000); // 1 hour
  }

  async checkForNewAnnouncements() {
    try {
      const response = await this.client.post('getFinancialAnnouncement');
      // Fix: API returns { reqFinancialAnnouncemnets: [...] }
      const announcements = response.data?.reqFinancialAnnouncemnets || [];
      
      if (announcements.length === 0) {
        console.log('📢 No new CSE announcements found');
        return;
      }

      console.log(`📢 Found ${announcements.length} CSE announcements`);
      for (const announcement of announcements) {
        await this.processAnnouncement(announcement);
      }
    } catch (error) {
      console.error('CSE announcement check failed:', error.message);
    }
  }

  async processAnnouncement(announcement) {
    try {
      const symbol = announcement.symbol || announcement.companyCode;
      if (!symbol) return;

      const announcementDate = new Date(announcement.manualDate || announcement.uploadedDate);

      const exists = await FinancialDocument.findOne({
        symbol,
        'period.periodEndDate': announcementDate
      });
      if (exists) return;

      console.log(`📄 New document for ${symbol}`);
      let companyInfo = {};
      try {
        const params = new URLSearchParams();
        // Use realTimeStockService formatter or ensure standard suffix
        let formattedSym = symbol;
        if (formattedSym.length <= 5 && !formattedSym.includes('.')) formattedSym += '.N0000';
        params.append('symbol', formattedSym);
        const infoRes = await this.client.post('companyInfoSummery', params);
        companyInfo = infoRes.data || {};
      } catch {
        // Proceed with partial data if company info fetch fails
      }

      // Extract the base ticker if symbol has a suffix (e.g., COMB.N0000 -> COMB)
      const baseTicker = String(symbol).split('.')[0].toUpperCase();

      let stock = await Stock.findOne({ ticker: baseTicker });
      if (!stock) {
        console.log(`➕ Auto-adding missing stock: ${baseTicker}`);
        
        // Use CSE info if available, otherwise fallback to defaults
        const name = companyInfo?.reqSymbolInfo?.name || baseTicker;
        const price = companyInfo?.reqSymbolInfo?.lastTradedPrice || 0;
        
        stock = new Stock({
          ticker: baseTicker,
          companyName: name,
          sector: 'Unclassified', // CSE API doesn't specify sector here
          currentPrice: price
        });
        await stock.save();
      }

      const financialData = this.extractFinancialData(announcement, companyInfo);

      const financialDoc = new FinancialDocument({
        stockId: stock._id,
        symbol,
        documentType: this.getDocumentType(announcement),
        period: {
          fiscalYear: new Date().getFullYear(),
          quarter: this.getQuarter(announcement),
          periodEndDate: announcementDate
        },
        source: 'CSE',
        publishedDate: new Date(),
        ...financialData
      });

      await financialDoc.save();
      console.log(`✅ Saved financial document for ${symbol}`);
      await calculationService.calculateForStock(symbol);
    } catch (error) {
      console.error(`Error processing announcement for ${announcement?.symbol}:`, error.message);
    }
  }

  extractFinancialData(announcement, companyInfo) {
    return {
      revenue: announcement.revenue || 0,
      netIncome: announcement.profit || 0,
      totalAssets: companyInfo?.totalAssets || 0,
      totalLiabilities: companyInfo?.totalLiabilities || 0,
      shareholdersEquity: companyInfo?.equity || 0,
      currentAssets: companyInfo?.currentAssets || 0,
      currentLiabilities: companyInfo?.currentLiabilities || 0,
      inventory: announcement.inventory || 0,
      eps: announcement.eps || 0,
      bookValuePerShare: companyInfo?.bookValue || 0,
      dividendPerShare: announcement.dividend || 0,
      totalDebt: companyInfo?.totalDebt || 0,
      outstandingShares: companyInfo?.shares || 0
    };
  }

  getDocumentType(announcement) {
    if (announcement.type?.includes('Annual')) return 'annual';
    if (announcement.type?.includes('Quarter')) return 'quarterly';
    return 'interim';
  }

  getQuarter(announcement) {
    const month = new Date(announcement.manualDate || announcement.uploadedDate).getMonth();
    return Math.floor(month / 3) + 1;
  }
}

export default new CSEIntegrationService();