import { loadDataToDatabase } from "./data-loader";

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeOnServerStart() {
  if (isInitialized) {
    return;
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("🚀 Initializing AskPalestine server...");
      await loadDataToDatabase();
      console.log("✅ Database initialized successfully");
      isInitialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      initializationPromise = null; // Allow retry
      throw error; // Let the API call know it failed
    }
  })();

  return initializationPromise;
}
