import cseIntegrationService from '../src/services/cseIntegrationService.js';
import FinancialDocument from '../src/models/financialDocumentModel.js';
import Stock from '../src/models/Stock.js';
import calculationService from '../src/services/calculationService.js';

jest.mock('axios');
jest.mock('../src/models/financialDocumentModel.js');
jest.mock('../src/models/Stock.js');
jest.mock('../src/services/calculationService.js');

describe('CSEIntegrationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDocumentType', () => {
        it('should return annual for annual reports', () => {
            expect(cseIntegrationService.getDocumentType({ type: 'Annual Report 2023' })).toBe('annual');
        });
        it('should return quarterly for quarterly reports', () => {
            expect(cseIntegrationService.getDocumentType({ type: 'Quarter Report' })).toBe('quarterly');
        });
        it('should return interim for other types', () => {
            expect(cseIntegrationService.getDocumentType({ type: 'Something else' })).toBe('interim');
        });
    });

    describe('getQuarter', () => {
        it('should return 1 for January dates', () => {
            expect(cseIntegrationService.getQuarter({ uploadedDate: '2023-01-15' })).toBe(1);
        });
        it('should return 4 for December dates', () => {
            expect(cseIntegrationService.getQuarter({ uploadedDate: '2023-12-15' })).toBe(4);
        });
    });

    describe('extractFinancialData', () => {
        it('should extract data correctly from announcement and company info', () => {
            const announcement = { revenue: 1000, profit: 200, inventory: 50, eps: 1.5, dividend: 0.5 };
            const companyInfo = { totalAssets: 5000, equity: 3000, currentAssets: 2000, bookValue: 10 };
            
            const result = cseIntegrationService.extractFinancialData(announcement, companyInfo);
            
            expect(result.revenue).toBe(1000);
            expect(result.netIncome).toBe(200);
            expect(result.totalAssets).toBe(5000);
            expect(result.shareholdersEquity).toBe(3000);
            expect(result.eps).toBe(1.5);
            expect(result.bookValuePerShare).toBe(10);
        });
    });
});
