// Import the Google AI plugin for Genkit to access Google models like Gemini
import { googleAI } from '@genkit-ai/google-genai';
// Import dotenv to load environment variables from a .env file
import dotenv from 'dotenv';
// Import the Genkit core framework used to configure AI workflows
import { genkit } from 'genkit';

// Load environment variables from .env file
dotenv.config();

// Create and export a configured Genkit AI instance
export const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-1.5-flash',
});
