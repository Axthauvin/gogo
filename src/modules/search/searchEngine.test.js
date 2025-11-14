/**
 * Tests for searchEngine module
 */

import { jest } from "@jest/globals";

// Mock shortcutManager before importing searchEngine
jest.unstable_mockModule("../shortcuts/shortcutManager.js", () => ({
  getAllShortcuts: jest.fn(),
}));

const { getAllShortcuts } = await import("../shortcuts/shortcutManager.js");
const { searchShortcuts } = await import("./searchEngine.js");

describe("filterShortcuts", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock storage for searchShortcuts
    getAllShortcuts.mockResolvedValue([
      { alias: "git", url: "https://github.com" },
      { alias: "yt", url: "https://youtube.com" },
      { alias: "fb", url: "https://facebook.com" },
    ]);
  });

  test("should filter shortcuts by alias", async () => {
    const filtered = await searchShortcuts("git");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].alias).toBe("git");
  });

  test("should filter shortcuts by URL", async () => {
    const filtered = await searchShortcuts("youtube");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].alias).toBe("yt");
  });

  test("should return all shortcuts when query is empty", async () => {
    const filtered = await searchShortcuts("");
    expect(filtered).toHaveLength(3);
  });

  test("should return empty array when no matches found", async () => {
    const filtered = await searchShortcuts("nomatch");
    expect(filtered).toHaveLength(0);
  });
});
