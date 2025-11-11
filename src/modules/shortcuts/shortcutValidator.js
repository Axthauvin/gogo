/**
 * Shortcut Validator
 * Validates shortcut inputs
 */

/**
 * Validate a shortcut alias
 * @param {string} alias
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateAlias(alias) {
  if (!alias || alias.trim() === "") {
    return { valid: false, error: "Alias cannot be empty" };
  }

  const trimmed = alias.trim();

  if (trimmed.length < 1) {
    return { valid: false, error: "Alias is too short" };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: "Alias is too long (max 50 characters)" };
  }

  // Check for invalid characters (spaces, special chars)
  if (!/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
    return {
      valid: false,
      error:
        "Alias can only contain letters, numbers, hyphens, and underscores",
    };
  }

  return { valid: true };
}

/**
 * Validate a URL
 * @param {string} url
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateUrl(url) {
  if (!url || url.trim() === "") {
    return { valid: false, error: "URL cannot be empty" };
  }

  const trimmed = url.trim();

  try {
    // Try to create a URL object
    let urlToTest = trimmed;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      urlToTest = "https://" + trimmed;
    }

    new URL(urlToTest);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Validate a complete shortcut
 * @param {string} alias
 * @param {string} url
 * @returns {Object} - { valid: boolean, errors: Object }
 */
export function validateShortcut(alias, url) {
  const aliasValidation = validateAlias(alias);
  const urlValidation = validateUrl(url);

  return {
    valid: aliasValidation.valid && urlValidation.valid,
    errors: {
      alias: aliasValidation.valid ? null : aliasValidation.error,
      url: urlValidation.valid ? null : urlValidation.error,
    },
  };
}
