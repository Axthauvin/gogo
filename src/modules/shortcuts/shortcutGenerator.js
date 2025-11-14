/**
 * Shortcut Name Generator
 * Generates smart shortcut names from URLs
 */

// Common domain mappings for popular sites
const COMMON_MAPPINGS = {
  github: "git",
  youtube: "yt",
  stackoverflow: "so",
  facebook: "fb",
  instagram: "ig",
  twitter: "tw",
  linkedin: "li",
  wikipedia: "wiki",
  amazon: "amz",
  reddit: "reddit",
  gmail: "gmail",
  "mail.google": "gmail",
};

/**
 * Generate a smart shortcut name from a URL
 * @param {string} url - The URL to generate a name from
 * @returns {string|null} - Generated shortcut name or null if failed
 */
export function generateShortcutName(url) {
  try {
    // Handle URLs without protocol
    let urlToProcess = url.trim();
    if (
      !urlToProcess.startsWith("http://") &&
      !urlToProcess.startsWith("https://")
    ) {
      urlToProcess = "https://" + urlToProcess;
    }

    const urlObj = new URL(urlToProcess);
    const hostname = urlObj.hostname;

    // Remove www. prefix
    const domain = hostname.replace(/^www\./, "");

    // Extract the main part of the domain (before .com, .org, etc.)
    const parts = domain.split(".");

    // If it's a simple domain like "google.com"
    if (parts.length >= 2) {
      const mainPart = parts[0];

      // Check if there's a common mapping
      if (COMMON_MAPPINGS[mainPart]) {
        return COMMON_MAPPINGS[mainPart];
      }

      // For longer names, create an abbreviation
      if (mainPart.length > 8) {
        // Try to create an acronym by removing vowels
        const consonants = mainPart.replace(/[aeiou]/gi, "");
        if (consonants.length >= 2 && consonants.length <= 5) {
          return consonants.toLowerCase().substring(0, 5);
        }
        // Otherwise just truncate
        return mainPart.substring(0, 6).toLowerCase();
      }

      // Return the main part as-is if it's short enough
      return mainPart.toLowerCase();
    }

    return null;
  } catch (error) {
    console.error("Error generating shortcut name:", error);
    return null;
  }
}

/**
 * Add a custom domain mapping
 * @param {string} domain - Domain name
 * @param {string} shortcut - Shortcut name
 */
export function addCustomMapping(domain, shortcut) {
  COMMON_MAPPINGS[domain] = shortcut;
}

/**
 * Get all domain mappings
 * @returns {Object}
 */
export function getAllMappings() {
  return { ...COMMON_MAPPINGS };
}
