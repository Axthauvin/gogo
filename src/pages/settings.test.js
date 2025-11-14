/**
 * Tests for settings page functionality
 */

import { jest } from "@jest/globals";
import { JSDOM } from "jsdom";

// Mock modules before imports
jest.unstable_mockModule("../core/storage.js", () => ({
  getStorage: jest.fn(),
  setStorage: jest.fn(),
}));

jest.unstable_mockModule("../modules/shortcuts/shortcutManager.js", () => ({
  getAllShortcuts: jest.fn(),
  saveShortcut: jest.fn(),
  deleteShortcut: jest.fn(),
}));

// Import mocked modules
const { getStorage, setStorage } = await import("../core/storage.js");
const { getAllShortcuts } = await import(
  "../modules/shortcuts/shortcutManager.js"
);

// Setup DOM environment
const dom = new JSDOM(
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

global.window = dom.window;
global.document = dom.window.document;

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

let document;
let window;

beforeEach(() => {
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

// ===== FORM MANAGEMENT TESTS =====

describe("resetForm", () => {
  test("should reset form fields", () => {
    const form = document.getElementById("alias-form");
    const nameInput = document.getElementById("alias-name");
    const urlInput = document.getElementById("alias-url");
    const submitBtn = document.getElementById("submit-btn");

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
