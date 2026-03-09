import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:9003/api',
});

export const searchNews = async (params) => {
    try {
        const response = await api.get('/news/search', {
            params: typeof params === 'string' ? { q: params } : params
        });
        return response.data;
    } catch (error) {
        console.error('Error searching news:', error);
        throw error;
    }
};

export const summarizeArticle = async (content) => {
    try {
        const response = await api.post('/news/summarize', {
            content: content
        });
        return response.data;
    } catch (error) {
        console.error('Error summarizing article:', error);
        throw error;
    }
};

export default api;
