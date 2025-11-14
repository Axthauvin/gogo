/**
 * Browser API Abstraction Layer
 * Provides a unified API for Chrome and Firefox
 */

export const browserAPI = typeof browser !== "undefined" ? browser : chrome;
export const isFirefox = typeof browser !== "undefined";
