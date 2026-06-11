// server/config.js

/**
 * @file Configuration file for the AI-Powered Content Summarizer backend server.
 * @description This file centralizes all environment-dependent and static configurations
 *              for the Node.js server, ensuring easy management and scalability.
 *              It loads sensitive information from environment variables and provides
 *              sensible defaults for development.
 */

// Load environment variables from .env file in non-production environments.
// This allows developers to configure local settings without modifying code.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/**
 * @constant {object} config - The main configuration object for the server.
 * @property {number} PORT - The port on which the Node.js server will listen.
 * @property {string} NODE_ENV - The current environment (e.g., 'development', 'production', 'test').
 * @property {string} CLIENT_URL - The URL of the frontend client application. Used for CORS and redirects.
 * @property {string} NLP_SERVICE_URL - The base URL for the Python NLP summarization service.
 * @property {string} NLP_SERVICE_SUMMARIZE_ENDPOINT - The specific endpoint for summarization on the NLP service.
 * @property {string} NLP_SERVICE_HEALTH_ENDPOINT - The specific endpoint for health checks on the NLP service.
 * @property {string[]} ALLOWED_ORIGINS - An array of origins allowed to make requests to this server (CORS).
 * @property {number} RATE_LIMIT_WINDOW_MS - The time window for API rate limiting in milliseconds.
 * @property {number} RATE_LIMIT_MAX_REQUESTS - The maximum number of requests allowed within the rate limit window.
 *
 * @property {string} ECOMMERCE_STOREFRONT_URL - URL for the E-commerce Storefront service (cross-project context).
 * @property {string} COLLABORATIVE_CODE_EDITOR_URL - URL for the Collaborative Code Editor service (cross-project context).
 * @property {string} RECIPE_MEAL_PLANNER_URL - URL for the Recipe & Meal Planner service (cross-project context).
 * @property {string} FULL_STACK_BLOG_PLATFORM_URL - URL for the Full-Stack Blog Platform service (cross-project context).
 */
const config = {
  // --- Server Configuration ---
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000', // Default React dev server URL

  // --- NLP Service Configuration ---
  // The URL for the Python NLP service. In a Docker Compose setup, this would typically
  // be the service name (e.g., 'nlp-service') for inter-container communication.
  NLP_SERVICE_URL: process.env.NLP_SERVICE_URL || 'http://localhost:8000',
  NLP_SERVICE_SUMMARIZE_ENDPOINT: '/summarize',
  NLP_SERVICE_HEALTH_ENDPOINT: '/health',

  // --- CORS Configuration ---
  // Defines which origins are allowed to access this server's resources.
  // In production, this should be strictly limited to your frontend domain(s).
  // Multiple origins can be specified by comma-separating them in the environment variable.
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000', // Default React development server
        'http://localhost:5000', // This Node.js server itself (if serving static files or for testing)
        // Add your production frontend URL(s) here, e.g., 'https://your-summarizer-app.com'
      ],

  // --- API Rate Limiting Configuration (Example) ---
  // Helps prevent abuse and ensures fair usage of the API.
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,         // Max 100 requests per 15 minutes per IP

  // --- Cross-Project / Microservice Integration Context ---
  // These URLs represent other services within the larger ecosystem.
  // While not directly used by the summarizer's core functionality,
  // they illustrate awareness of the interconnected architecture.
  // This service might, for example, push summaries to the Blog Platform
  // or fetch content from the E-commerce Storefront in future integrations.
  ECOMMERCE_STOREFRONT_URL: process.env.ECOMMERCE_STOREFRONT_URL || 'http://localhost:3001',
  COLLABORATIVE_CODE_EDITOR_URL: process.env.COLLABORATIVE_CODE_EDITOR_URL || 'http://localhost:3002',
  RECIPE_MEAL_PLANNER_URL: process.env.RECIPE_MEAL_PLANNER_URL || 'http://localhost:3003',
  FULL_STACK_BLOG_PLATFORM_URL: process.env.FULL_STACK_BLOG_PLATFORM_URL || 'http://localhost:3004',

  // --- Security Configuration (Placeholders/Examples) ---
  // If this service were to handle user authentication or interact with external APIs
  // requiring keys, they would be configured here.
  // JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_please_change',
  // EXTERNAL_API_KEY: process.env.EXTERNAL_API_KEY || 'your_external_service_api_key',
};

module.exports = config;