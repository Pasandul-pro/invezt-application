import apiClient from './apiClient.js';

/**
 * Search for news articles
 * @param {string|object} params - search query string or object with {q, sortBy, language}
 */
export const searchNews = async (params) => {
  const res = await apiClient.get('/news/search', {
    params: typeof params === 'string' ? { q: params } : params
  });
  return res.data;
};

/**
 * Summarize a news article using AI
 * @param {string} content - article text content (min 50 chars)
 */
export const summarizeArticle = async (content) => {
  const res = await apiClient.post('/news/summarize', { content });
  return res.data;
};

export default apiClient;
