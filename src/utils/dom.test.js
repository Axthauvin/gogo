/**
 * Tests for DOM utility functions
 */

import { jest } from "@jest/globals";

// Import function to test
const { escapeHtml } = await import("./dom.js");

describe("escapeHtml", () => {
  test("should escape HTML special characters", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert("xss")&lt;/script&gt;'
    );
    expect(escapeHtml("Hello & goodbye")).toBe("Hello &amp; goodbye");
    expect(escapeHtml('"quoted"')).toBe('"quoted"');
  });

  test("should handle empty strings", () => {
    expect(escapeHtml("")).toBe("");
  });
});
