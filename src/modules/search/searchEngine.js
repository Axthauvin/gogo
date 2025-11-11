/**
 * Search Engine
 * Filters shortcuts based on search query
 */

import { getAllShortcuts } from "../shortcuts/shortcutManager.js";

/**
 * Search shortcuts by alias or URL
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Filtered shortcuts with original indices
 */
export async function searchShortcuts(query) {
  const shortcuts = await getAllShortcuts();

  if (!query || query.trim() === "") {
    return shortcuts.map((item, index) => ({ ...item, originalIndex: index }));
  }

  const normalizedQuery = query.toLowerCase();

  return shortcuts
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter(
      ({ alias, url }) =>
        alias.toLowerCase().includes(normalizedQuery) ||
        url.toLowerCase().includes(normalizedQuery)
    );
}

/**
 * Get search suggestions based on query
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of suggestions
 * @returns {Promise<Array>}
 */
export async function getSearchSuggestions(query, limit = 10) {
  const shortcuts = await getAllShortcuts();

  if (!query || query.trim() === "") {
    return [];
  }

  const normalizedQuery = query.toLowerCase();

  return shortcuts
    .filter((item) => item.alias.toLowerCase().includes(normalizedQuery))
    .slice(0, limit);
}
