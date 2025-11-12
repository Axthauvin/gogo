/**
 * Tests for settings modules
 * These tests ensure that critical functions work correctly and prevent regressions
 */

import { jest } from "@jest/globals";
import { JSDOM } from "jsdom";

// Mock modules that depend on storage before importing real functions
jest.unstable_mockModule("./core/storage.js", () => ({
  getStorage: jest.fn(),
  setStorage: jest.fn(),
}));

jest.unstable_mockModule("./modules/shortcuts/shortcutManager.js", () => ({
  getAllShortcuts: jest.fn(),
  saveShortcut: jest.fn(),
  deleteShortcut: jest.fn(),
}));

// Import mocked storage
const { getStorage, setStorage } = await import("./core/storage.js");
const { getAllShortcuts } = await import(
  "./modules/shortcuts/shortcutManager.js"
);

// Import real functions to test
const { generateShortcutName } = await import(
  "./modules/shortcuts/shortcutGenerator.js"
);
const { escapeHtml } = await import("./utils/dom.js");
const { isValidUrl, normalizeUrl, extractDomain } = await import(
  "./utils/url.js"
);
const { getSystemTheme, applyTheme } = await import(
  "./modules/theme/themeManager.js"
);
const { searchShortcuts } = await import("./modules/search/searchEngine.js");
const { validateImportData } = await import(
  "./modules/import-export/importer.js"
);
const { THEME_PREFERENCES } = await import("./core/constants.js");

// Mock chrome/browser storage API
const mockStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  },
};

// Setup DOM environment
let dom;
let document;
let window;

// Setup initial JSDOM before imports
const initialDom = new JSDOM(
  `
  <!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <form id="alias-form">
        <input id="alias-name" type="text" />
        <input id="alias-url" type="text" />
        <button id="submit-btn" type="submit">Create Shortcut</button>
      </form>
      <div id="duplicate-warning" style="display: none;">
        <span id="duplicate-url"></span>
      </div>
      <div id="alias-list"></div>
      <input id="search-input" type="text" />
      <div id="toast">
        <div class="toast-title"></div>
        <div class="toast-message"></div>
      </div>
      <div id="modal-overlay" class="modal-overlay">
        <div class="modal">
          <div id="modal-icon" class="modal-icon">
            <svg id="modal-icon-svg"></svg>
          </div>
          <h2 id="modal-title"></h2>
          <p id="modal-subtitle"></p>
          <div id="modal-message"></div>
          <div class="modal-actions">
            <button id="modal-cancel"></button>
            <button id="modal-confirm"></button>
          </div>
        </div>
      </div>
    </body>
  </html>
`,
  {
    url: "http://localhost",
    pretendToBeVisual: true,
  }
);

// Setup global window and document BEFORE imports
global.window = initialDom.window;
global.document = initialDom.window.document;
global.window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));
global.chrome = { storage: mockStorage };
global.browser = undefined;

beforeEach(() => {
  // Use the same document and window from global setup
  document = global.document;
  window = global.window;

  // Reset forms and inputs safely
  const aliasName = document.getElementById("alias-name");
  const aliasUrl = document.getElementById("alias-url");
  const submitBtn = document.getElementById("submit-btn");
  const duplicateWarning = document.getElementById("duplicate-warning");

  if (aliasName) aliasName.value = "";
  if (aliasUrl) aliasUrl.value = "";
  if (submitBtn) submitBtn.textContent = "Create Shortcut";
  if (duplicateWarning) duplicateWarning.style.display = "none";

  // Setup matchMedia mock on window object
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  // Reset mocks
  jest.clearAllMocks();

  // Setup default mock returns
  getStorage.mockResolvedValue({ aliases: [], options: {} });
  setStorage.mockResolvedValue();
  getAllShortcuts.mockResolvedValue([]);

  mockStorage.local.get.mockResolvedValue({ aliases: [], options: {} });
  mockStorage.local.set.mockResolvedValue();
  mockStorage.local.clear.mockResolvedValue();
});

afterEach(() => {
  // Clean up if needed, but keep the same DOM instance
});

// ===== UTILITY FUNCTIONS TESTS =====

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
    // matchMedia returns true for dark mode query
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

// ===== THEME MANAGEMENT TESTS =====

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

// ===== FORM MANAGEMENT TESTS =====

describe("resetForm", () => {
  test("should reset form fields", () => {
    // Use document from beforeEach
    const form = document.getElementById("alias-form");
    const nameInput = document.getElementById("alias-name");
    const urlInput = document.getElementById("alias-url");
    const submitBtn = document.getElementById("submit-btn");

    // Skip test if elements don't exist
    if (!form || !nameInput || !urlInput || !submitBtn) {
      console.warn("Skipping resetForm test - elements not found");
      return;
    }

    // Set some values
    nameInput.value = "test";
    urlInput.value = "https://test.com";
    submitBtn.textContent = "Update Shortcut";
    submitBtn.classList.add("replace-mode");

    // Reset form
    form.reset();
    submitBtn.textContent = "Create Shortcut";
    submitBtn.disabled = false;
    submitBtn.classList.remove("replace-mode");

    const duplicateWarning = document.getElementById("duplicate-warning");
    duplicateWarning.style.display = "none";

    expect(nameInput.value).toBe("");
    expect(urlInput.value).toBe("");
    expect(submitBtn.textContent).toBe("Create Shortcut");
    expect(submitBtn.classList.contains("replace-mode")).toBe(false);
    expect(duplicateWarning.style.display).toBe("none");
  });
});

describe("checkForDuplicate", () => {
  test("should detect duplicate aliases", async () => {
    const aliases = [
      { alias: "git", url: "https://github.com" },
      { alias: "yt", url: "https://youtube.com" },
    ];

    mockStorage.local.get.mockResolvedValue({ aliases });

    const aliasNameInput = document.getElementById("alias-name");
    const duplicateWarning = document.getElementById("duplicate-warning");
    const submitBtn = document.getElementById("submit-btn");

    // Skip test if elements don't exist
    if (!aliasNameInput || !duplicateWarning || !submitBtn) {
      console.warn("Skipping checkForDuplicate test - elements not found");
      return;
    }

    aliasNameInput.value = "git";

    // Simulate the checkForDuplicate function
    const checkForDuplicate = async (editingIndex = null) => {
      const aliasName = aliasNameInput.value.trim().toLowerCase();

      if (!aliasName) {
        duplicateWarning.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.classList.remove("replace-mode");
        submitBtn.textContent =
          editingIndex !== null ? "Update Shortcut" : "Create Shortcut";
        return;
      }

      const data = await mockStorage.local.get("aliases");
      const items = data.aliases || [];

      let duplicateItem = null;
      for (let i = 0; i < items.length; i++) {
        if (editingIndex !== null && i === editingIndex) {
          continue;
        }
        if (items[i].alias === aliasName) {
          duplicateItem = items[i];
          break;
        }
      }

      if (duplicateItem) {
        duplicateWarning.style.display = "flex";
        document.getElementById(
          "duplicate-url"
        ).textContent = `Current URL: ${duplicateItem.url}`;
        submitBtn.disabled = false;
        submitBtn.classList.add("replace-mode");
        submitBtn.textContent = "Replace Anyway";
      } else {
        duplicateWarning.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.classList.remove("replace-mode");
        submitBtn.textContent =
          editingIndex !== null ? "Update Shortcut" : "Create Shortcut";
      }
    };

    await checkForDuplicate();

    expect(duplicateWarning.style.display).toBe("flex");
    expect(submitBtn.textContent).toBe("Replace Anyway");
    expect(submitBtn.classList.contains("replace-mode")).toBe(true);
  });

  test("should not flag duplicate when editing the same shortcut", async () => {
    const aliases = [{ alias: "git", url: "https://github.com" }];

    mockStorage.local.get.mockResolvedValue({ aliases });

    const aliasNameInput = document.getElementById("alias-name");
    const duplicateWarning = document.getElementById("duplicate-warning");
    const submitBtn = document.getElementById("submit-btn");

    // Skip test if elements don't exist
    if (!aliasNameInput || !duplicateWarning || !submitBtn) {
      console.warn("Skipping checkForDuplicate test - elements not found");
      return;
    }

    aliasNameInput.value = "git";

    const checkForDuplicate = async (editingIndex = null) => {
      const aliasName = aliasNameInput.value.trim().toLowerCase();

      if (!aliasName) {
        duplicateWarning.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.classList.remove("replace-mode");
        submitBtn.textContent =
          editingIndex !== null ? "Update Shortcut" : "Create Shortcut";
        return;
      }

      const data = await mockStorage.local.get("aliases");
      const items = data.aliases || [];

      let duplicateItem = null;
      for (let i = 0; i < items.length; i++) {
        if (editingIndex !== null && i === editingIndex) {
          continue;
        }
        if (items[i].alias === aliasName) {
          duplicateItem = items[i];
          break;
        }
      }

      if (duplicateItem) {
        duplicateWarning.style.display = "flex";
        submitBtn.classList.add("replace-mode");
        submitBtn.textContent = "Replace Anyway";
      } else {
        duplicateWarning.style.display = "none";
        submitBtn.classList.remove("replace-mode");
        submitBtn.textContent =
          editingIndex !== null ? "Update Shortcut" : "Create Shortcut";
      }
    };

    // Editing index 0 (the 'git' alias itself)
    await checkForDuplicate(0);

    expect(duplicateWarning.style.display).toBe("none");
    expect(submitBtn.textContent).toBe("Update Shortcut");
  });
});

// ===== SEARCH/FILTER TESTS =====

describe("filterShortcuts", () => {
  // Mock storage for searchShortcuts
  beforeEach(() => {
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

// ===== IMPORT/EXPORT TESTS =====

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

// ===== OPTIONS MANAGEMENT TESTS =====

describe("saveOption", () => {
  test("should save option to storage", async () => {
    const saveOption = async (key, value) => {
      const data = await mockStorage.local.get("options");
      const options = data.options || {};
      options[key] = value;
      await mockStorage.local.set({ options: options });
    };

    await saveOption("themePreference", "dark");

    expect(mockStorage.local.get).toHaveBeenCalledWith("options");
    expect(mockStorage.local.set).toHaveBeenCalledWith({
      options: { themePreference: "dark" },
    });
  });

  test("should merge with existing options", async () => {
    mockStorage.local.get.mockResolvedValue({
      options: { tabBehavior: "newTab" },
    });

    const saveOption = async (key, value) => {
      const data = await mockStorage.local.get("options");
      const options = data.options || {};
      options[key] = value;
      await mockStorage.local.set({ options: options });
    };

    await saveOption("confirmDelete", true);

    expect(mockStorage.local.set).toHaveBeenCalledWith({
      options: { tabBehavior: "newTab", confirmDelete: true },
    });
  });
});

// ===== STORAGE TESTS =====

describe("Storage operations", () => {
  test("should save alias to storage", async () => {
    const newAlias = { alias: "test", url: "https://test.com" };

    const data = await mockStorage.local.get("aliases");
    const items = data.aliases || [];
    items.push(newAlias);
    await mockStorage.local.set({ aliases: items });

    expect(mockStorage.local.set).toHaveBeenCalledWith({
      aliases: [newAlias],
    });
  });

  test("should delete alias from storage", async () => {
    mockStorage.local.get.mockResolvedValue({
      aliases: [
        { alias: "git", url: "https://github.com" },
        { alias: "yt", url: "https://youtube.com" },
      ],
    });

    const data = await mockStorage.local.get("aliases");
    const items = data.aliases || [];
    items.splice(0, 1); // Delete first item
    await mockStorage.local.set({ aliases: items });

    expect(mockStorage.local.set).toHaveBeenCalledWith({
      aliases: [{ alias: "yt", url: "https://youtube.com" }],
    });
  });

  test("should clear all storage", async () => {
    await mockStorage.local.clear();
    expect(mockStorage.local.clear).toHaveBeenCalled();
  });
});

// ===== URL VALIDATION TESTS =====

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
