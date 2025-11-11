/**
 * Shortcut Manager
 * Handles CRUD operations for shortcuts
 */

import { getStorage, setStorage } from "../../core/storage.js";
import { STORAGE_KEYS } from "../../core/constants.js";

/**
 * Get all shortcuts
 * @returns {Promise<Array>}
 */
export async function getAllShortcuts() {
  const data = await getStorage(STORAGE_KEYS.ALIASES);
  return data.aliases || [];
}

/**
 * Save a new shortcut or update existing one
 * @param {string} alias - Shortcut name
 * @param {string} url - Target URL
 * @param {number|null} editingIndex - Index if editing existing shortcut
 * @returns {Promise<Object>} Result with success status and message
 */
export async function saveShortcut(alias, url, editingIndex = null) {
  const shortcuts = await getAllShortcuts();

  // Normalize inputs
  const normalizedAlias = alias.trim().toLowerCase();
  const normalizedUrl = url.trim().toLowerCase();

  // Check for duplicates (excluding the one being edited)
  const duplicateIndex = shortcuts.findIndex((item, index) => {
    if (editingIndex !== null && index === editingIndex) {
      return false;
    }
    return item.alias === normalizedAlias;
  });

  if (duplicateIndex !== -1) {
    return {
      success: false,
      duplicate: true,
      duplicateIndex,
      message: `Shortcut "${normalizedAlias}" already exists`,
    };
  }

  // If editing, remove the old entry
  if (editingIndex !== null) {
    shortcuts.splice(editingIndex, 1);
  }

  // Add new shortcut
  shortcuts.push({
    alias: normalizedAlias,
    url: normalizedUrl,
  });

  await setStorage({ [STORAGE_KEYS.ALIASES]: shortcuts });

  return {
    success: true,
    message:
      editingIndex !== null
        ? `Shortcut "${normalizedAlias}" updated!`
        : `Shortcut "${normalizedAlias}" saved!`,
  };
}

/**
 * Replace an existing shortcut
 * @param {number} index - Index of shortcut to replace
 * @param {string} alias - New alias
 * @param {string} url - New URL
 * @returns {Promise<Object>}
 */
export async function replaceShortcut(index, alias, url) {
  const shortcuts = await getAllShortcuts();

  shortcuts[index] = {
    alias: alias.trim().toLowerCase(),
    url: url.trim().toLowerCase(),
  };

  await setStorage({ [STORAGE_KEYS.ALIASES]: shortcuts });

  return {
    success: true,
    message: `Shortcut "${alias}" replaced!`,
  };
}

/**
 * Delete a shortcut
 * @param {number} index - Index of shortcut to delete
 * @returns {Promise<Object>}
 */
export async function deleteShortcut(index) {
  const shortcuts = await getAllShortcuts();
  const deletedShortcut = shortcuts[index];

  shortcuts.splice(index, 1);
  await setStorage({ [STORAGE_KEYS.ALIASES]: shortcuts });

  return {
    success: true,
    deletedAlias: deletedShortcut.alias,
    message: `Shortcut "${deletedShortcut.alias}" deleted!`,
  };
}

/**
 * Get a shortcut by index
 * @param {number} index
 * @returns {Promise<Object|null>}
 */
export async function getShortcut(index) {
  const shortcuts = await getAllShortcuts();
  return shortcuts[index] || null;
}

/**
 * Find a shortcut by alias
 * @param {string} alias
 * @returns {Promise<Object|null>}
 */
export async function findShortcutByAlias(alias) {
  const shortcuts = await getAllShortcuts();
  return (
    shortcuts.find((item) => item.alias === alias.trim().toLowerCase()) || null
  );
}

/**
 * Check if an alias already exists
 * @param {string} alias
 * @param {number|null} excludeIndex - Index to exclude from check (for editing)
 * @returns {Promise<Object>}
 */
export async function checkDuplicate(alias, excludeIndex = null) {
  const shortcuts = await getAllShortcuts();
  const normalizedAlias = alias.trim().toLowerCase();

  const duplicateIndex = shortcuts.findIndex((item, index) => {
    if (excludeIndex !== null && index === excludeIndex) {
      return false;
    }
    return item.alias === normalizedAlias;
  });

  return {
    isDuplicate: duplicateIndex !== -1,
    duplicateIndex,
    existingUrl: duplicateIndex !== -1 ? shortcuts[duplicateIndex].url : null,
  };
}
