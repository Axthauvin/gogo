/**
 * Settings Page - Main Entry Point
 * Orchestrates all modules for the settings page
 */

// Core modules
import { initTheme } from "../modules/theme/themeManager.js";
import { getStorage, setStorage } from "../core/storage.js";
import { STORAGE_KEYS } from "../core/constants.js";

// UI Components
import { modal } from "../ui/components/modal.js";
import { showToast } from "../ui/components/toast.js";
import { ShortcutList } from "../ui/components/shortcutList.js";

// UI Forms
import { ShortcutForm } from "../ui/forms/shortcutForm.js";
import { OptionsForm } from "../ui/forms/optionsForm.js";

// Navigation
import { Navigation } from "../ui/navigation.js";

// Search
import { searchShortcuts } from "../modules/search/searchEngine.js";

// Import/Export
import { exportShortcuts } from "../modules/import-export/exporter.js";
import { importShortcuts } from "../modules/import-export/importer.js";

// Onboarding (keep existing logic from onboarding.js)
import {
  showOnboarding,
  setupShortcutCards,
  hideOnboarding,
} from "./onboarding.js";

// Global state
let shortcutList;
let shortcutForm;
let optionsForm;
let navigation;

/**
 * Initialize the settings page
 */
async function init() {
  // Initialize theme
  await initTheme();

  // Initialize modal
  modal.init();

  // Initialize navigation
  navigation = new Navigation();

  // Initialize shortcut list
  const listElement = document.getElementById("alias-list");
  shortcutList = new ShortcutList(listElement);

  // Setup callbacks
  shortcutList.onEdit = handleEdit;
  shortcutList.onDelete = () => shortcutList.reload();

  // Load shortcuts
  await shortcutList.reload();

  // Initialize shortcut form
  shortcutForm = new ShortcutForm();
  shortcutForm.onSave = () => shortcutList.reload();

  // Initialize options form
  optionsForm = new OptionsForm();
  optionsForm.onDataCleared = () => shortcutList.reload();

  // Setup search
  setupSearch();

  // Setup export/import
  setupExportImport();

  // Handle query parameters
  handleQueryParams();

  // Check onboarding status
  checkOnboarding();
  setupShortcutCards();
}

/**
 * Handle editing a shortcut
 */
function handleEdit(index) {
  navigation.navigateTo("create");
  shortcutForm.loadForEdit(index);
}

/**
 * Setup search functionality
 */
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    const results = await searchShortcuts(query);
    await shortcutList.display(results, true);
  });
}

/**
 * Setup export/import functionality
 */
function setupExportImport() {
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");

  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      const result = await exportShortcuts();
      showToast(result.message, result.success ? "success" : "info");
    });
  }

  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => importFile.click());

    importFile.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const result = await importShortcuts(file);
      showToast(result.message, result.success ? "success" : "info");

      if (result.success) {
        await shortcutList.reload();
      }

      // Reset file input
      event.target.value = "";
    });
  }
}

/**
 * Handle URL query parameters
 */
function handleQueryParams() {
  const params = new URLSearchParams(window.location.search);

  // Handle section parameter
  const section = params.get("section");
  if (section === "list") {
    navigation.navigateTo("list");
    return;
  }

  // Handle URL parameter (pre-fill URL field)
  const url = params.get("url");
  if (url) {
    shortcutForm.prefillUrl(url);
  }

  // Handle create parameter (pre-fill alias name)
  const createAlias = params.get("create");
  if (createAlias) {
    shortcutForm.prefillAlias(createAlias);
  }
}

/**
 * Check onboarding status
 */
async function checkOnboarding() {
  const data = await getStorage(STORAGE_KEYS.ONBOARDING_COMPLETED);
  if (!data[STORAGE_KEYS.ONBOARDING_COMPLETED]) {
    showOnboarding();
  } else {
    console.log("Onboarding already completed.");
    hideOnboarding();
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", init);
