// Stub for src/ai/genkit.js  (the configured Genkit ai instance)
const ai = {
  definePrompt: jest.fn((config) => jest.fn()),
  defineFlow: jest.fn((config, fn) => fn),
};

module.exports = { ai };
