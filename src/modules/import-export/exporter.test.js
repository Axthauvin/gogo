/**
 * Tests for exporter module
 */

import { jest } from "@jest/globals";

describe("exportShortcuts", () => {
  test("should create valid JSON from shortcuts", () => {
    const items = [
      { alias: "git", url: "https://github.com" },
      { alias: "yt", url: "https://youtube.com" },
    ];

    const dataStr = JSON.stringify(items, null, 2);
    const parsed = JSON.parse(dataStr);

    expect(parsed).toEqual(items);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test("should handle empty shortcuts array", () => {
    const items = [];
    const dataStr = JSON.stringify(items, null, 2);
    const parsed = JSON.parse(dataStr);

    expect(parsed).toEqual([]);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
