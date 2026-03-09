import { googleAI } from '@genkit-ai/google-genai';
import dotenv from 'dotenv';
import { genkit } from 'genkit';

// AI configuration 
dotenv.config();

export const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-1.5-flash',
});
