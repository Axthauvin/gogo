/**
 * Omnibox Handler
 * Handles omnibox (address bar) input and navigation
 */

import { browserAPI } from "../core/browserAPI.js";
import { getStorage } from "../core/storage.js";
import { STORAGE_KEYS } from "../core/constants.js";
import { isSpecialPage, isExtensionPage } from "../utils/url.js";
import { setupAutocomplete } from "../modules/search/autocomplete.js";

/**
 * Setup omnibox handlers
 */
export function setupOmniboxHandler() {
  // Setup autocomplete suggestions
  setupAutocomplete();

  // Handle omnibox input (when user presses Enter)
  browserAPI.omnibox.onInputEntered.addListener(handleOmniboxInput);
}

/**
 * Handle omnibox input when user presses Enter
 * @param {string} text - Input text
 * @param {string} disposition - How to open (currentTab, newForegroundTab, newBackgroundTab)
 */
async function handleOmniboxInput(text, disposition) {
  const query = (text || "").trim();
  if (!query) return;

  // Get stored shortcuts and options
  const data = await getStorage([STORAGE_KEYS.ALIASES, STORAGE_KEYS.OPTIONS]);
  const shortcuts = data.aliases || [];
  const options = data.options || { tabBehavior: "newTab" };

  // Find matching shortcut
  const shortcut = shortcuts.find((item) => item.alias === query.toLowerCase());

  let targetUrl;
  if (shortcut) {
    // Found shortcut - navigate to its URL
    targetUrl = shortcut.url;
  } else {
    // Not found - open settings to create new shortcut
    targetUrl = `src/settings.html?create=${encodeURIComponent(query)}`;
  }

  // Get current tab
  const tabs = await browserAPI.tabs.query({
    active: true,
    currentWindow: true,
  });
  const currentTab = tabs[0];
  const currentUrl = currentTab?.url || "";

  // Determine how to open the URL
  const shouldReplaceTab =
    isSpecialPage(currentUrl) || isExtensionPage(currentUrl);

  if (shouldReplaceTab) {
    // Replace current tab
    await browserAPI.tabs.update(currentTab.id, { url: targetUrl });
  } else {
    // On regular webpage: respect user's tab behavior preference (only for found shortcuts)
    if (shortcut && options.tabBehavior === "replaceTab") {
      await browserAPI.tabs.update(currentTab.id, { url: targetUrl });
    } else {
      // Default: open in new tab
      await browserAPI.tabs.create({ url: targetUrl });
    }
  }
}
