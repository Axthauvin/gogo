/**
 * Background Script
 * Main entry point for the extension's background service worker
 */

import { browserAPI } from "../core/browserAPI.js";
import { setupNavigationHandler } from "./navigationHandler.js";
import { setupOmniboxHandler } from "./omniboxHandler.js";

// Initialize navigation handler
setupNavigationHandler();

// Initialize omnibox handler
setupOmniboxHandler();

// Handle extension installation
browserAPI.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Open the onboarding page in a new tab
    const settingsPath = browserAPI.runtime.getURL("src/settings.html");
    browserAPI.tabs.create({ url: settingsPath });
  }
});
