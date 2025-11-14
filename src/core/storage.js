/**
 * Storage API Abstraction Layer
 * Handles storage operations for both Chrome and Firefox
 */

import { browserAPI } from "./browserAPI.js";

export const storage = browserAPI.storage;

/**
 * Get data from storage
 * @param {string|string[]} keys - Key(s) to retrieve
 * @returns {Promise<Object>}
 */
export async function getStorage(keys) {
  return await storage.local.get(keys);
}

/**
 * Set data in storage
 * @param {Object} data - Data to store
 * @returns {Promise<void>}
 */
export async function setStorage(data) {
  return await storage.local.set(data);
}

/**
 * Clear all storage data
 * @returns {Promise<void>}
 */
export async function clearStorage() {
  return await storage.local.clear();
}

/**
 * Remove specific keys from storage
 * @param {string|string[]} keys - Key(s) to remove
 * @returns {Promise<void>}
 */
export async function removeStorage(keys) {
  return await storage.local.remove(keys);
}
