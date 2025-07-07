import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Validates the API key before initialization
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} True if valid
 */
const validateApiKey = (apiKey) => {
  if (!apiKey || apiKey === 'your_vite_gemini_api_key' || apiKey.length < 10) {
    console.error('Invalid or missing Gemini API key. Please check your .env file.');
    return false;
  }
  return true;
};

/**
 * Initializes the Gemini client with the API key from environment variables.
 * @returns {GoogleGenerativeAI} Configured Gemini client instance.
 */
const initializeGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!validateApiKey(apiKey)) {
    throw new Error('Gemini API key is required. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini client initialized successfully');
    return genAI;
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
    throw new Error('Failed to initialize Gemini API client');
  }
};

const genAI = initializeGeminiClient();

export default genAI;