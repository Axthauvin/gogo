/**
 * Shortcut Importer
 * Handles importing shortcuts from JSON
 */

import { getAllShortcuts } from "../shortcuts/shortcutManager.js";
import { setStorage } from "../../core/storage.js";
import { STORAGE_KEYS } from "../../core/constants.js";

/**
 * Import shortcuts from a file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Result with success status and message
 */
export async function importShortcuts(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const importedShortcuts = JSON.parse(e.target.result);

        if (!Array.isArray(importedShortcuts)) {
          resolve({
            success: false,
            message: "Invalid file format!",
          });
          return;
        }

        // Validate shortcuts structure
        const validShortcuts = importedShortcuts.filter(
          (item) => item && typeof item === "object" && item.alias && item.url
        );

        if (validShortcuts.length === 0) {
          resolve({
            success: false,
            message: "No valid shortcuts found in file!",
          });
          return;
        }

        // Merge with existing shortcuts (avoid duplicates)
        const existingShortcuts = await getAllShortcuts();
        const existingAliases = new Set(
          existingShortcuts.map((item) => item.alias)
        );

        const newShortcuts = validShortcuts.filter(
          (item) => !existingAliases.has(item.alias)
        );

        if (newShortcuts.length === 0) {
          resolve({
            success: false,
            message: "All shortcuts already exist!",
          });
          return;
        }

        const mergedShortcuts = [...existingShortcuts, ...newShortcuts];
        await setStorage({ [STORAGE_KEYS.ALIASES]: mergedShortcuts });

        resolve({
          success: true,
          count: newShortcuts.length,
          message: `${newShortcuts.length} shortcut${
            newShortcuts.length !== 1 ? "s" : ""
          } imported successfully!`,
        });
      } catch (error) {
        console.error("Import error:", error);
        resolve({
          success: false,
          message: "Error reading file. Please check the file format.",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: "Error reading file.",
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Validate imported shortcuts data
 * @param {Array} shortcuts
 * @returns {Object}
 */
export function validateImportData(shortcuts) {
  if (!Array.isArray(shortcuts)) {
    return {
      valid: false,
      error: "Data must be an array",
    };
  }

  const validShortcuts = shortcuts.filter(
    (item) => item && typeof item === "object" && item.alias && item.url
  );

  return {
    valid: validShortcuts.length > 0,
    validCount: validShortcuts.length,
    totalCount: shortcuts.length,
  };
}
