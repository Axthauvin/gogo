/**
 * Shortcut Exporter
 * Handles exporting shortcuts to JSON
 */

import { getAllShortcuts } from "../shortcuts/shortcutManager.js";

/**
 * Export shortcuts to a JSON file
 * @returns {Promise<Object>} Result with success status and message
 */
export async function exportShortcuts() {
  const shortcuts = await getAllShortcuts();

  if (shortcuts.length === 0) {
    return {
      success: false,
      message: "No shortcuts to export!",
    };
  }

  const dataStr = JSON.stringify(shortcuts, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gogo-shortcuts-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    count: shortcuts.length,
    message: `${shortcuts.length} shortcut${
      shortcuts.length !== 1 ? "s" : ""
    } exported successfully!`,
  };
}
