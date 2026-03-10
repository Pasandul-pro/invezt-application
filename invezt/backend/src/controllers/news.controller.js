import { summarizeNewsArticleFlow } from '../util/ai.flows.js';
import { newsRepository } from '../util/news.repository.js';

/**
 * Controller for News-related routes.
 */
class NewsController {
    /**
     * Handles news search request.
     */
    async searchNews(req, res) {
        try {
            const { q, sortBy, language, apiKey } = req.query;
            const results = await newsRepository.fetchEverything({ q, sortBy, language, apiKey });
            res.json(results);
        } catch (error) {
            console.error('Search Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Handles article summarization request.
     */
    async summarizeArticle(req, res) {

        
    }

}