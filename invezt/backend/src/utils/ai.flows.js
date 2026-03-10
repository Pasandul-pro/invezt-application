import { z } from 'genkit';
import { ai } from '../config/ai.config.js';

const SummarizeNewsArticleInputSchema = z.object({
    articleContent: z
        .string()
        .describe('The full text content of the news article to be summarized.'),
});

const SummarizeNewsArticleOutputSchema = z.object({
    summary: z.string().describe('A concise summary of the news article.'),
});

export const summarizeNewsArticlePrompt = ai.definePrompt({
    name: 'summarizeNewsArticlePrompt',
    input: { schema: SummarizeNewsArticleInputSchema },
    output: { schema: SummarizeNewsArticleOutputSchema },
    prompt: `Summarize the following news article concisely, focusing on its main points. The summary should be approximately 3-5 sentences long.
