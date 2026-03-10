import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NEWS_API_URL = "https://newsapi.org/v2";

/**
 * Repository for interacting with the NewsAPI.
 */
class NewsRepository {
    /**
     * Fetches news articles from NewsAPI.
     * @param {Object} params - Search parameters.
     * @param {string} params.q - Search query.
     * @param {string} [params.sortBy] - Sort by 'relevancy', 'popularity', or 'publishedAt'.
     * @param {string} [params.language] - Language code.
     * @param {string} [params.apiKey] - API key.
     * @returns {Promise<Object>}
     */
    async fetchEverything(params) {
        const { apiKey: providedKey, ...queryParams } = params;
        const apiKey = providedKey || process.env.NEWS_API_KEY;

        if (!apiKey) {
            throw new Error("NewsAPI key is missing.");
        }
    }
}

export const newsRepository = new NewsRepository();
