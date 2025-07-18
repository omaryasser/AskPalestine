#!/usr/bin/env node

const { loadDataToDatabase } = require("./lib/data-loader.ts");

async function main() {
  try {
    console.log("Initializing database...");
    await loadDataToDatabase();
    console.log("Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();
