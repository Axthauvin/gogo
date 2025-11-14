/**
 * Autocomplete Handler
 * Manages omnibox autocomplete suggestions
 */

import { browserAPI, isFirefox } from "../../core/browserAPI.js";
import { getStorage } from "../../core/storage.js";
import { STORAGE_KEYS } from "../../core/constants.js";

/**
 * Setup omnibox autocomplete listener
 */
export function setupAutocomplete() {
  browserAPI.omnibox.onInputChanged.addListener(handleInputChanged);
}

/**
 * Handle omnibox input changes
 * @param {string} text - Input text
 * @param {Function} suggest - Suggestion callback
 */
async function handleInputChanged(text, suggest) {
  const query = (text || "").trim().toLowerCase();

  // Get options to check if autocomplete is enabled
  const data = await getStorage([STORAGE_KEYS.ALIASES, STORAGE_KEYS.OPTIONS]);
  const options = data.options || { enableAutocomplete: true };

  // If autocomplete is disabled, don't show suggestions
  if (options.enableAutocomplete === false) {
    browserAPI.omnibox.setDefaultSuggestion({
      description: "Type a shortcut name",
    });
    return;
  }

  const shortcuts = data.aliases || [];

  if (!query) {
    browserAPI.omnibox.setDefaultSuggestion({
      description: "Type a shortcut name",
    });
    return;
  }

  if (shortcuts.length === 0) {
    browserAPI.omnibox.setDefaultSuggestion({
      description: "No shortcuts created yet",
    });
    return;
  }

  // Find matching shortcuts
  const matches = shortcuts
    .filter((item) => item.alias.toLowerCase().includes(query))
    .slice(0, 10);

  if (matches.length === 0) {
    browserAPI.omnibox.setDefaultSuggestion({
      description: isFirefox
        ? `Create new shortcut: ${text}`
        : `Create new shortcut: <match>${text}</match>`,
    });
    suggest([]);
    return;
  }

  // Set the first match as the default suggestion
  const firstMatch = matches[0];
  browserAPI.omnibox.setDefaultSuggestion({
    description: isFirefox
      ? `${firstMatch.alias} → ${firstMatch.url}`
      : `<match>${firstMatch.alias}</match> → <url>${firstMatch.url}</url>`,
  });

  // Show remaining matches in dropdown
  const remainingMatches = matches.slice(1).map((item) => ({
    content: item.alias,
    description: isFirefox
      ? `${item.alias} → ${item.url}`
      : `<match>${item.alias}</match> → <dim>${item.url}</dim>`,
  }));

  suggest(remainingMatches);
}

/**
 * Get formatted suggestion for display
 * @param {Object} shortcut
 * @returns {string}
 */
export function formatSuggestion(shortcut) {
  if (isFirefox) {
    return `${shortcut.alias} → ${shortcut.url}`;
  }
  return `<match>${shortcut.alias}</match> → <dim>${shortcut.url}</dim>`;
}
