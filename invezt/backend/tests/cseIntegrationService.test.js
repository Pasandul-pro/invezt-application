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

        });
    });
});
