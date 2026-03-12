import { newsRepository } from '../repositories/news.repository.js';

/**
 * News Service for handling news-related business logic.
 */
class NewsService {
    /**
     * Orchestrates news search functionality.
     * @param {Object} params - Search parameters.
     * @returns {Promise<Object>}
     */
    async searchNews(params) {
        // Add business logic here if needed (e.g., validation, caching, formatting)
        return newsRepository.fetchEverything(params);
    }
}

export const newsService = new NewsService();
