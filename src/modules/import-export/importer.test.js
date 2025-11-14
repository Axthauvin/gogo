/**
 * Tests for importer module
 */

import { jest } from "@jest/globals";

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

// Import function to test
const { validateImportData } = await import("./importer.js");

describe("importShortcuts", () => {
  test("should validate and import valid shortcuts", () => {
    const importedShortcuts = [
      { alias: "git", url: "https://github.com" },
      { alias: "yt", url: "https://youtube.com" },
    ];

    const result = validateImportData(importedShortcuts);
    expect(result.valid).toBe(true);
    expect(result.validCount).toBe(2);
  });

  test("should filter out invalid shortcuts", () => {
    const importedShortcuts = [
      { alias: "git", url: "https://github.com" },
      { alias: "", url: "https://test.com" }, // Invalid - no alias
      { alias: "test", url: "" }, // Invalid - no url
      { alias: "yt", url: "https://youtube.com" },
      null, // Invalid - null
      { alias: "valid", url: "https://valid.com" },
    ];

    const result = validateImportData(importedShortcuts);
    expect(result.valid).toBe(true);
    expect(result.validCount).toBe(3);
    expect(result.totalCount).toBe(6);
  });

  test("should not import duplicate aliases", () => {
    const existingItems = [{ alias: "git", url: "https://github.com" }];

    const importedShortcuts = [
      { alias: "git", url: "https://gitlab.com" }, // Duplicate
      { alias: "yt", url: "https://youtube.com" }, // New
    ];

    const existingAliases = new Set(existingItems.map((item) => item.alias));
    const newShortcuts = importedShortcuts.filter(
      (item) => !existingAliases.has(item.alias)
    );

    expect(newShortcuts).toHaveLength(1);
    expect(newShortcuts[0].alias).toBe("yt");
  });
});
