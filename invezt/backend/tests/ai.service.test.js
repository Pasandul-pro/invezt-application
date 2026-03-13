import { aiService } from '../src/services/ai.service.js';
import { summarizeNewsArticleFlow } from '../src/ai/flows/summarize-news-article.js';

jest.mock('../src/ai/flows/summarize-news-article.js');

describe('AiService', () => {
    it('should generate AI summary for valid content', async () => {
        const content = "This is a long article content that is definitely more than fifty characters long to pass the validation check.";
        summarizeNewsArticleFlow.mockResolvedValue({ summary: "Mocked summary" });
        
        const result = await aiService.generateAiSummary(content);
        
        expect(result.summary).toBe("Mocked summary");
        expect(summarizeNewsArticleFlow).toHaveBeenCalledWith({ articleContent: content });
    });

    it('should throw error for short content', async () => {
        const content = "Short content";
        await expect(aiService.generateAiSummary(content)).rejects.toThrow("Content too short for AI analysis.");
    });
});
