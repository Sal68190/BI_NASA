// backend/index.js 
https://github.com/Sal68190/BI_NASA/tree/main/backend
import express from 'express';
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

console.log('🔍 Starting NASA API with debugging...');

const app = express();
const PORT = process.env.PORT || 5000;

// Your NASA API Key
const NASA_API_KEY = process.env.NASA_API_KEY || 'Wf5LzTmm4jL34AvlbfVduImeHmpapFXEZOJMC0pk';

// Middleware
console.log('📝 Setting up middleware...');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug function to wrap route creation
function createRoute(method, path, handler) {
  console.log(`🛤️  Creating ${method.toUpperCase()} route: ${path}`);
  try {
    return app[method](path, handler);
  } catch (error) {
    console.error(`❌ Error creating route ${method.toUpperCase()} ${path}:`, error.message);
    throw error;
  }
}

// Basic check for malformed route definitions
function validateRoutePath(path) {
  const invalidColon = /:($|\/)/;
  if (invalidColon.test(path)) {
    throw new Error(`Invalid route path: "${path}" is missing a parameter name.`);
  }
}

try {
  // Root endpoint
  console.log('🏠 Setting up root endpoint...');
  createRoute('get', '/', (req, res) => {
    res.json({
      message: '🚀 NASA Explorer API is running!',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        apod: '/api/apod?date=2025-06-30',
        mars: '/api/mars-photos?rover=curiosity&sol=1000',
        neo: '/api/neo?start_date=2025-06-30',
        epic: '/api/epic'
      }
    });
  });

  // Health check
  console.log('❤️  Setting up health check endpoint...');
  createRoute('get', '/api/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      nasa_api_key: NASA_API_KEY ? 'Configured ✅' : 'Missing ❌'
    });
  });

  // Astronomy Picture of the Day
  console.log('🌌 Setting up APOD endpoint...');
  createRoute('get', '/api/apod', async (req, res) => {
    try {
      const params = { api_key: NASA_API_KEY };
      if (req.query.date) params.date = req.query.date;

      const response = await axios.get('https://api.nasa.gov/planetary/apod', { params });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: 'Failed to fetch APOD',
        details: error.response?.data || error.message
      });
    }
  });

  // Mars Rover Photos
  console.log('🔴 Setting up Mars photos endpoint...');
  createRoute('get', '/api/mars-photos', async (req, res) => {
    try {
      const rover = req.query.rover || 'curiosity';
      const sol = req.query.sol || '1000';

      const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`, {
        params: { sol, api_key: NASA_API_KEY }
      });

      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: 'Failed to fetch Mars photos',
        details: error.response?.data || error.message
      });
    }
  });

  // Near Earth Objects
  console.log('☄️  Setting up NEO endpoint...');
  createRoute('get', '/api/neo', async (req, res) => {
    try {
      const startDate = req.query.start_date;
      const endDate = req.query.end_date || startDate;

      if (!startDate) {
        return res.status(400).json({ error: 'start_date parameter is required' });
      }

      const response = await axios.get('https://api.nasa.gov/neo/rest/v1/feed', {
        params: { start_date: startDate, end_date: endDate, api_key: NASA_API_KEY }
      });

      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: 'Failed to fetch NEO data',
        details: error.response?.data || error.message
      });
    }
  });

  // EPIC Earth Imagery
  console.log('🌍 Setting up EPIC endpoint...');
  createRoute('get', '/api/epic', async (req, res) => {
    try {
      const response = await axios.get('https://api.nasa.gov/EPIC/api/natural/images', {
        params: { api_key: NASA_API_KEY }
      });

      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: 'Failed to fetch EPIC imagery',
        details: error.response?.data || error.message
      });
    }
  });

  // 404 for unknown API routes
  console.log('🔍 Setting up 404 handler...');
  createRoute('all', /^\/api\/.*$/, (req, res) => {
    res.status(404).json({
      error: 'API endpoint not found',
      requested: req.originalUrl,
      available: ['/api/health', '/api/apod', '/api/mars-photos', '/api/neo', '/api/epic']
    });
  });

  console.log('✅ All routes created successfully!');

} catch (error) {
  console.error('❌ Error during route setup:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Catch unhandled promise rejections or uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
});

// Start server
console.log('🚀 Starting server...');
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 NASA EXPLORER API SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${NASA_API_KEY.substring(0, 8)}...${NASA_API_KEY.slice(-4)}`);
  console.log('='.repeat(60));
  console.log('✅ Ready to receive requests!\n');
});

module.exports = app;
