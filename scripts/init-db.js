#!/usr/bin/env node

const { getDatabase } = require("../lib/database.ts");

async function main() {
  try {
    console.log("Initializing database...");
    await getDatabase(); // This will initialize and load data
    console.log("Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();
