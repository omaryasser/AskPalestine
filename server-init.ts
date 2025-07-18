import { loadDataToDatabase } from './lib/data-loader';

// Initialize database when the server starts
async function initializeServer() {
  try {
    console.log('🚀 Initializing AskPalestine server...');
    await loadDataToDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    // Don't crash the server, but log the error
  }
}

// Call initialization
initializeServer();

export {};
