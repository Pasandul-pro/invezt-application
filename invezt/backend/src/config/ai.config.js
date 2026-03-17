import { googleAI } from '@genkit-ai/google-genai';
import dotenv from 'dotenv';
import { genkit } from 'genkit';

dotenv.config();

export const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
});
