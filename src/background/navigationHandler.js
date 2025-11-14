/**
 * Navigation Handler
 * Handles web navigation events
 */

import { browserAPI } from "../core/browserAPI.js";
import { LOG_KEY } from "../core/constants.js";

/**
 * Setup navigation listeners
 */
export function setupNavigationHandler() {
  browserAPI.webNavigation.onCommitted.addListener(handleNavigation);
}

/**
 * Handle navigation events
 * @param {Object} details - Navigation details
 */
async function handleNavigation(details) {
  // Filter subframes - only track top frame navigation
  if (details.frameId === 0) {
    const entry = {
      when: new Date().toISOString(),
      type: "webNavigation.onCommitted",
      url: details.url,
      tabId: details.tabId,
      transitionType: details.transitionType,
    };

    // Log navigation event if needed
    // This can be expanded for analytics or debugging
  }
}
