import valuationService from '../src/services/valuationService.js';

describe('ValuationService', () => {
    describe('calculateDCF', () => {
        it('should calculate DCF correctly', () => {
            const data = {
                cashFlows: [100, 110, 121, 133.1],
                discountRate: 10,
                perpetualGrowthRate: 2,
                sharesOutstanding: 100
            };
        });
    });
});
