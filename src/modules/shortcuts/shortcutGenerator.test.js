/**
 * Tests for shortcutGenerator module
 */

import { jest } from "@jest/globals";

// Import function to test
const { generateShortcutName } = await import("./shortcutGenerator.js");

describe("generateShortcutName", () => {
  test("should generate correct shortcuts for common sites", () => {
    expect(generateShortcutName("https://github.com")).toBe("git");
    expect(generateShortcutName("https://youtube.com")).toBe("yt");
    expect(generateShortcutName("https://stackoverflow.com")).toBe("so");
    expect(generateShortcutName("https://facebook.com")).toBe("fb");
    expect(generateShortcutName("https://reddit.com")).toBe("reddit");
  });

  test("should handle URLs without protocol", () => {
    expect(generateShortcutName("github.com")).toBe("git");
    expect(generateShortcutName("youtube.com")).toBe("yt");
  });

  test("should remove www prefix", () => {
    expect(generateShortcutName("https://www.github.com")).toBe("git");
    expect(generateShortcutName("www.google.com")).toBe("google");
  });

  test("should generate shortcuts for unknown domains", () => {
    expect(generateShortcutName("https://example.com")).toBe("example");
    expect(generateShortcutName("https://test.org")).toBe("test");
  });

  test("should abbreviate long domain names", () => {
    const result = generateShortcutName("https://verylongdomainname.com");
    expect(result).toBeDefined();
    expect(result.length).toBeLessThanOrEqual(6);
  });

  test("should handle invalid URLs gracefully", () => {
    expect(generateShortcutName("not a url")).toBeNull();
    expect(generateShortcutName("")).toBeNull();
  });
});
