/**
 * Mock for genkit and all @genkit-ai/* packages.
 * Exports every symbol the source files destructure from these packages.
 */
const z = {
    object: () => ({ describe: () => ({}) }),
    string: () => ({ describe: () => ({}) }),
};

// genkit() factory – used in src/ai/genkit.js
const genkit = jest.fn(() => ({
    definePrompt: jest.fn((config) => jest.fn().mockResolvedValue({ output: { summary: '' } })),
    defineFlow: jest.fn((config, fn) => fn),
}));

// googleAI() plugin factory – used in src/ai/genkit.js via @genkit-ai/google-genai
const googleAI = jest.fn(() => ({}));

module.exports = { z, genkit, googleAI };
