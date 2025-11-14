/**
 * URL Utilities
 * Helper functions for URL manipulation
 */

/**
 * Normalize a URL by adding protocol if missing
 * @param {string} url
 * @returns {string}
 */
export function normalizeUrl(url) {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }
  return trimmed;
}

/**
 * Check if URL is valid
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  try {
    const normalized = normalizeUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 * @param {string} url
 * @returns {string|null}
 */
export function extractDomain(url) {
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Check if URL is a special browser page
 * @param {string} url
 * @returns {boolean}
 */
export function isSpecialPage(url) {
  return (
    url === "" ||
    url === "about:newtab" ||
    url === "chrome://newtab/" ||
    url === "about:blank" ||
    url.startsWith("chrome://") ||
    url.startsWith("about:") ||
    url.startsWith("moz-extension:")
  );
}

/**
 * Check if URL is an extension page
 * @param {string} url
 * @returns {boolean}
 */
export function isExtensionPage(url) {
  return (
    url.includes("src/settings.html") ||
    url.includes("src/popup.html") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("moz-extension://")
  );
}
