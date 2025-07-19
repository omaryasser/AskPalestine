#!/usr/bin/env node

// Custom server startup script for Next.js standalone
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '80', 10);

// Initialize database before starting the server
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing AskPalestine server...');
    const { loadDataToDatabase } = require('./lib/data-loader');
    await loadDataToDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    // Don't crash the server, continue anyway
  }
}

async function startServer() {
  // Initialize database first
  await initializeDatabase();
  
  // Start Next.js server
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`🌐 Server ready on http://${hostname}:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
