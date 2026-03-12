import axios from 'axios';
import { newsRepository } from '../repositories/news.repository.js';

/**
 * Summarize a news article using the Gemini REST API directly via axios.
 * No SDK required — uses GEMINI_API_KEY from environment.
 */
async function summarizeWithGemini(content) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      parts: [{
        text: `Summarize the following news article concisely in 3-5 sentences, focusing on key points relevant to investors:\n\n${content}`
      }]
    }]
  };

  const response = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000
  });

  const summary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!summary) throw new Error('No summary returned from Gemini');
  return { summary };
}

class NewsController {
  /** Search for relevant news articles */
  async searchNews(req, res) {
    try {
      const { q, sortBy, language, apiKey } = req.query;
      const results = await newsRepository.fetchEverything({ q, sortBy, language, apiKey });
      res.json(results);
    } catch (error) {
      console.error('News search error:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  /** Generate AI summary for an article via Gemini */
  async summarizeArticle(req, res) {
    try {
      const { content } = req.body;
      if (!content || content.length < 50) {
        return res.status(400).json({ error: 'Content too short. Provide at least 50 characters.' });
      }
      const summary = await summarizeWithGemini(content);
      res.json(summary);
    } catch (error) {
      console.error('Summarization error:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
}

export const newsController = new NewsController();