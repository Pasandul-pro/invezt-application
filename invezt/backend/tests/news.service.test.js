import { newsService } from '../src/services/news.service.js';
import { newsRepository } from '../src/repositories/news.repository.js';

jest.mock('../src/repositories/news.repository.js');

describe('NewsService', () => {
    it('should call newsRepository.fetchEverything with provided params', async () => {
        const params = { q: 'stocks', language: 'en' };
        newsRepository.fetchEverything.mockResolvedValue({ articles: [] });
        
        const result = await newsService.searchNews(params);
        
        expect(newsRepository.fetchEverything).toHaveBeenCalledWith(params);
        expect(result.articles).toEqual([]);
    });
});
