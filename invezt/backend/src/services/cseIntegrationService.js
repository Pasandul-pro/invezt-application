const axios = require('axios');
const FinancialDocument = require('../models/financialDocumentModel');
const calculationService = require('./calculationService');

class CSEIntegrationService {
  constructor() {
    this.baseURL = 'https://www.cse.lk/api/';
  }

  /**
   * Start polling CSE for new announcements
   */
  startPolling() {
    console.log('🔄 Starting CSE polling every 5 minutes...');
    
    // Poll every 5 minutes
    setInterval(async () => {
      await this.checkForNewAnnouncements();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Also run immediately on startup
    this.checkForNewAnnouncements();
  }

  /**
   * Check for new financial announcements from CSE
   */
  async checkForNewAnnouncements() {
    try {
      // Call CSE API to get latest announcements
      const response = await axios.post(this.baseURL + 'getFinancialAnnouncement');
      
      const announcements = response.data;
      
      if (!announcements || announcements.length === 0) {
        return;
      }

      console.log(`📢 Found ${announcements.length} announcements`);

      // Process each announcement
      for (const announcement of announcements) {
        await this.processAnnouncement(announcement);
      }
    } catch (error) {
      console.error('Error checking CSE announcements:', error.message);
    }
  }

  /**
   * Process a single announcement
   */
  async processAnnouncement(announcement) {
    try {
      // Extract symbol from announcement
      const symbol = announcement.symbol || announcement.companyCode;
      
      if (!symbol) return;

      // Check if we already have this document
      const exists = await FinancialDocument.findOne({
        symbol: symbol,
        'period.periodEndDate': new Date(announcement.date)
      });

      if (exists) {
        return; // Already processed
      }

      console.log(`📄 New document detected for ${symbol}`);

      // Get company info from CSE
      const companyInfo = await axios.post(this.baseURL + 'companyInfoSummery', {
        symbol: symbol
      });

      // Extract financial data (simplified - you'd parse actual numbers)
      const financialData = this.extractFinancialData(announcement, companyInfo.data);

      // Save to database
      const financialDoc = new FinancialDocument({
        stockId: announcement.stockId,
        symbol: symbol,
        documentType: this.getDocumentType(announcement),
        period: {
          fiscalYear: new Date().getFullYear(),
          quarter: this.getQuarter(announcement),
          periodEndDate: new Date(announcement.date)
        },
        source: 'CSE',
        publishedDate: new Date(),
        financialData: financialData
      });

      await financialDoc.save();
      console.log(`✅ Saved financial document for ${symbol}`);

      // AUTOMATICALLY CALCULATE THE 10 RATIOS!
      await calculationService.calculateForStock(symbol);
      console.log(`🧮 Calculated 10 ratios for ${symbol}`);

    } catch (error) {
      console.error('Error processing announcement:', error.message);
    }
  }

  /**
   * Extract financial data from announcement
   */
  extractFinancialData(announcement, companyInfo) {
    // This is simplified - in reality you'd parse the actual document
    // For now, we'll create sample data based on announcement type
    return {
      revenue: announcement.revenue || 1000000,
      netIncome: announcement.profit || 200000,
      totalAssets: companyInfo?.totalAssets || 5000000,
      totalLiabilities: companyInfo?.totalLiabilities || 2000000,
      shareholdersEquity: companyInfo?.equity || 3000000,
      currentAssets: companyInfo?.currentAssets || 2000000,
      currentLiabilities: companyInfo?.currentLiabilities || 1000000,
      inventory: announcement.inventory || 500000,
      eps: announcement.eps || 10.5,
      bookValuePerShare: companyInfo?.bookValue || 50,
      dividendPerShare: announcement.dividend || 2,
      totalDebt: companyInfo?.totalDebt || 1000000,
      outstandingShares: companyInfo?.shares || 100000
    };
  }

  getDocumentType(announcement) {
    if (announcement.type?.includes('Annual')) return 'annual';
    if (announcement.type?.includes('Quarter')) return 'quarterly';
    return 'interim';
  }

  getQuarter(announcement) {
    const month = new Date(announcement.date).getMonth();
    return Math.floor(month / 3) + 1;
  }
}

module.exports = new CSEIntegrationService();