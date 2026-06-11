const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config'); // Application configuration

// Initialize the Express application
const app = express();
const PORT = config.serverPort;

// --- Middleware ---

// Enable CORS (Cross-Origin Resource Sharing)
// This allows the React frontend (running on a different port/domain) to make requests to this backend.
// In a production environment, it's best practice to restrict `origin` to your specific frontend URL(s).
app.use(cors({
    origin: config.clientUrl, // Allow requests from the configured client URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // If you're using cookies/sessions
}));

// Parse JSON request bodies
// This middleware makes it easy to access JSON data sent in the request body via `req.body`.
app.use(bodyParser.json());

// Basic request logging middleware
// Logs incoming requests to the console, useful for debugging and monitoring.
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
    next(); // Pass control to the next middleware/route handler
});

// --- Routes ---

/**
 * @route GET /health
 * @description Health check endpoint for the service.
 * @returns {object} Status of the service and its dependencies.
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'AI-Powered Content Summarizer Backend',
        version: '1.0.0', // Consider dynamic versioning in a real CI/CD pipeline
        environment: process.env.NODE_ENV || 'development',
        dependencies: {
            nlpService: {
                url: config.nlpServiceUrl,
                status: 'unknown' // A more advanced health check would ping this service
            },
            // Example of referencing other services in a larger interconnected system
            // This helps in understanding the microservice landscape.
            // ecommerceStorefront: process.env.ECOMMERCE_STOREFRONT_URL || 'http://localhost:3001',
            // collaborativeCodeEditor: process.env.CODE_EDITOR_URL || 'http://localhost:3002',
            // recipeMealPlanner: process.env.RECIPE_PLANNER_URL || 'http://localhost:3003',
            // blogPlatform: process.env.BLOG_PLATFORM_URL || 'http://localhost:3004',
        },
        uptime: process.uptime() // Server uptime in seconds
    });
});

/**
 * @route POST /api/summarize
 * @description Endpoint to request a summary from the NLP service.
 * @body {string} [text] - The text content to summarize.
 * @body {string} [url] - The URL of the content to summarize.
 * @body {string} [length='medium'] - Desired summary length ('short', 'medium', 'long').
 * @returns {object} The generated summary.
 * @throws {400} If input is invalid (e.g., missing text/url, both provided, invalid length).
 * @throws {500} If there's an internal server error or issues communicating with the NLP service.
 */
app.post('/api/summarize', async (req, res, next) => {
    const { text, url, length = 'medium' } = req.body; // Default length to 'medium'

    // --- Input Validation ---
    if (!text && !url) {
        console.warn('Validation Error: Either "text" or "url" must be provided.');
        return res.status(400).json({ error: 'Either "text" or "url" must be provided.' });
    }
    if (text && url) {
        console.warn('Validation Error: Cannot provide both "text" and "url". Please choose one.');
        return res.status(400).json({ error: 'Cannot provide both "text" and "url". Please choose one.' });
    }
    const validLengths = ['short', 'medium', 'long'];
    if (!validLengths.includes(length)) {
        console.warn(`Validation Error: Invalid summary length "${length}". Must be one of: ${validLengths.join(', ')}.`);
        return res.status(400).json({ error: `Invalid summary length. Must be "${validLengths.join('", "')}".` });
    }

    try {
        console.log(`Forwarding summary request to NLP service. Input type: ${text ? 'text' : 'URL'}, Length: ${length}`);

        // Make an HTTP POST request to the NLP service
        // The NLP service (Python Flask app) is expected to be running at `config.nlpServiceUrl`.
        const nlpServiceResponse = await axios.post(`${config.nlpServiceUrl}/summarize`, {
            text, // Will be undefined if URL is provided
            url,  // Will be undefined if text is provided
            length,
        }, {
            timeout: config.nlpServiceTimeout || 30000 // Set a timeout for the NLP service request (e.g., 30 seconds)
        });

        // If the NLP service responds successfully, return its data to the client
        res.status(200).json(nlpServiceResponse.data);

    } catch (error) {
        // --- Error Handling for NLP Service Communication ---
        console.error('Error communicating with NLP service:', error.message);

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx (e.g., 4xx or 5xx from NLP service)
            console.error('NLP Service Error Response Data:', error.response.data);
            console.error('NLP Service Error Status:', error.response.status);
            return res.status(error.response.status).json({
                error: 'Failed to generate summary from NLP service.',
                details: error.response.data.error || 'Unknown error from NLP service.'
            });
        } else if (error.request) {
            // The request was made but no response was received (e.g., network error, timeout)
            console.error('NLP Service No Response (network error or timeout):', error.request);
            return res.status(503).json({
                error: 'NLP service is unavailable or did not respond within the expected time.',
                details: error.message
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request to NLP service:', error.message);
            return res.status(500).json({
                error: 'Internal server error when trying to reach NLP service.',
                details: error.message
            });
        }
    }
});

// --- Error Handling Middleware (Catch-all) ---
// This middleware catches any errors that were not handled by previous route handlers or middleware