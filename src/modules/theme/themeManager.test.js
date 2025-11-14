/**
 * Tests for themeManager module
 */

import { jest } from "@jest/globals";
import { JSDOM } from "jsdom";

// Setup DOM environment
const dom = new JSDOM(
  `<!DOCTYPE html><html><head></head><body></body></html>`,
  {
    url: "http://localhost",
    pretendToBeVisual: true,
  }
);

global.window = dom.window;
global.document = dom.window.document;

// Mock matchMedia
global.window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock chrome storage API
const mockStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  },
};

global.chrome = { storage: mockStorage };
global.browser = undefined;

// Import functions to test
const { getSystemTheme, applyTheme } = await import("./themeManager.js");
const { THEME_PREFERENCES } = await import("../../core/constants.js");

describe("getSystemTheme", () => {
  beforeEach(() => {
    // Mock matchMedia for each test
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  test('should return "dark" when system prefers dark mode', () => {
    expect(getSystemTheme()).toBe("dark");
  });

  test('should return "light" when system prefers light mode', () => {
    // Override mock for this test
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    expect(getSystemTheme()).toBe("light");
  });
});

describe("applyTheme", () => {
  beforeEach(() => {
    // Setup matchMedia mock
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  test('should apply light theme when preference is "light"', () => {
    applyTheme(THEME_PREFERENCES.LIGHT);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  test('should apply dark theme when preference is "dark"', () => {
    applyTheme(THEME_PREFERENCES.DARK);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  test('should apply system theme when preference is "auto"', () => {
    // System is set to dark mode in beforeEach
    applyTheme(THEME_PREFERENCES.AUTO);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
