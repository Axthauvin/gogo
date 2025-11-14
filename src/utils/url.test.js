/**
 * Tests for URL utility functions
 */

import { jest } from "@jest/globals";

// Import functions to test
const { isValidUrl, normalizeUrl, extractDomain } = await import("./url.js");

describe("URL validation", () => {
  test("should accept valid URLs", () => {
    expect(isValidUrl("https://github.com")).toBe(true);
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("github.com")).toBe(true);
    expect(isValidUrl("www.google.com")).toBe(true);
  });

  test("should reject invalid URLs", () => {
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("not a url")).toBe(false);
  });
});
