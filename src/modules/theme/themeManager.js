/**
 * Theme Manager
 * Handles theme preferences and application
 */

import { getStorage, setStorage } from "../../core/storage.js";
import { STORAGE_KEYS, THEME_PREFERENCES } from "../../core/constants.js";

/**
 * Get system theme preference
 * @returns {string} 'dark' or 'light'
 */
export function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Apply theme to the document
 * @param {string} preference - Theme preference (light, dark, auto)
 */
export function applyTheme(preference) {
  const htmlElement = document.documentElement;

  if (preference === THEME_PREFERENCES.LIGHT) {
    htmlElement.setAttribute("data-theme", "light");
  } else if (preference === THEME_PREFERENCES.DARK) {
    htmlElement.setAttribute("data-theme", "dark");
  } else {
    // auto - detect system preference
    const systemTheme = getSystemTheme();
    htmlElement.setAttribute("data-theme", systemTheme);
  }
}

/**
 * Load and apply theme from storage
 */
export async function loadTheme() {
  const data = await getStorage(STORAGE_KEYS.OPTIONS);
  const options = data.options || {};
  const themePreference = options.themePreference || THEME_PREFERENCES.AUTO;
  applyTheme(themePreference);
}

/**
 * Save theme preference
 * @param {string} preference - Theme preference
 */
export async function saveThemePreference(preference) {
  const data = await getStorage(STORAGE_KEYS.OPTIONS);
  const options = data.options || {};
  options.themePreference = preference;
  await setStorage({ [STORAGE_KEYS.OPTIONS]: options });
  applyTheme(preference);
}

/**
 * Setup theme change listener
 * Listens for system theme changes when set to auto
 */
export function setupThemeListener() {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", async () => {
      const data = await getStorage(STORAGE_KEYS.OPTIONS);
      const options = data.options || {};
      const themePreference = options.themePreference || THEME_PREFERENCES.AUTO;

      // Only update if user has set to auto
      if (themePreference === THEME_PREFERENCES.AUTO) {
        applyTheme(THEME_PREFERENCES.AUTO);
      }
    });
}

/**
 * Initialize theme system
 */
export async function initTheme() {
  await loadTheme();
  setupThemeListener();
}
