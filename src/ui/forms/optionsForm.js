/**
 * Options Form Handler
 * Manages the options/settings form
 */

import { getStorage, setStorage, clearStorage } from "../../core/storage.js";
import { STORAGE_KEYS, DEFAULT_OPTIONS } from "../../core/constants.js";
import { applyTheme } from "../../modules/theme/themeManager.js";
import { showToast } from "../components/toast.js";
import { modal } from "../components/modal.js";

export class OptionsForm {
  constructor() {
    this.init();
  }

  async init() {
    // Theme preference radio buttons
    const themeRadios = document.querySelectorAll(
      'input[name="theme-preference"]'
    );
    themeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.saveOption("themePreference", e.target.value);
        applyTheme(e.target.value);
        showToast("Theme updated!");
      });
    });

    // Tab behavior radio buttons
    const tabBehaviorRadios = document.querySelectorAll(
      'input[name="tab-behavior"]'
    );
    tabBehaviorRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.saveOption("tabBehavior", e.target.value);
        showToast("Tab behavior updated!");
      });
    });

    // Autocomplete toggle
    const autocompleteCheckbox = document.getElementById("enable-autocomplete");
    if (autocompleteCheckbox) {
      autocompleteCheckbox.addEventListener("change", (e) => {
        this.saveOption("enableAutocomplete", e.target.checked);
        showToast(
          e.target.checked ? "Autocomplete enabled" : "Autocomplete disabled"
        );
      });
    }

    // Delete confirmation toggle
    const confirmDeleteCheckbox = document.getElementById("confirm-delete");
    if (confirmDeleteCheckbox) {
      confirmDeleteCheckbox.addEventListener("change", (e) => {
        this.saveOption("confirmDelete", e.target.checked);
        showToast(
          e.target.checked
            ? "Delete confirmation enabled"
            : "Delete confirmation disabled"
        );
      });
    }

    // Clear all data button
    const clearAllBtn = document.getElementById("clear-all-btn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => this.clearAllData());
    }

    // Load current options
    await this.loadOptions();
  }

  async saveOption(key, value) {
    const data = await getStorage(STORAGE_KEYS.OPTIONS);
    const options = data.options || {};
    options[key] = value;
    await setStorage({ [STORAGE_KEYS.OPTIONS]: options });
  }

  async loadOptions() {
    const data = await getStorage(STORAGE_KEYS.OPTIONS);
    const options = data.options || DEFAULT_OPTIONS;

    // Update theme radio buttons
    const themeRadio = document.querySelector(
      `input[name="theme-preference"][value="${
        options.themePreference || "auto"
      }"]`
    );
    if (themeRadio) {
      themeRadio.checked = true;
    }

    // Apply the theme
    applyTheme(options.themePreference || "auto");

    // Update tab behavior radio buttons
    const tabBehaviorRadio = document.querySelector(
      `input[name="tab-behavior"][value="${options.tabBehavior}"]`
    );
    if (tabBehaviorRadio) {
      tabBehaviorRadio.checked = true;
    }

    // Update autocomplete checkbox
    const autocompleteCheckbox = document.getElementById("enable-autocomplete");
    if (autocompleteCheckbox) {
      autocompleteCheckbox.checked = options.enableAutocomplete !== false;
    }

    // Update confirm delete checkbox
    const confirmDeleteCheckbox = document.getElementById("confirm-delete");
    if (confirmDeleteCheckbox) {
      confirmDeleteCheckbox.checked = options.confirmDelete;
    }
  }

  clearAllData() {
    // Create first message
    const message1 = document.createElement("div");
    message1.textContent = "This will permanently delete ";

    const strong1 = document.createElement("strong");
    strong1.textContent = "ALL";
    message1.appendChild(strong1);
    message1.appendChild(document.createTextNode(" your shortcuts and reset "));

    const strong2 = document.createElement("strong");
    strong2.textContent = "ALL";
    message1.appendChild(strong2);
    message1.appendChild(document.createTextNode(" settings to default."));
    message1.appendChild(document.createElement("br"));
    message1.appendChild(document.createElement("br"));
    message1.appendChild(document.createTextNode("This action "));

    const strong3 = document.createElement("strong");
    strong3.textContent = "cannot be undone";
    message1.appendChild(strong3);
    message1.appendChild(document.createTextNode("."));

    modal.show({
      title: "⚠️ Clear All Data",
      subtitle: "This will delete everything",
      message: message1,
      confirmText: "Yes, Clear Everything",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        this.confirmClearAllData();
      },
    });
  }

  async confirmClearAllData() {
    // Create second message
    const message2 = document.createElement("div");
    message2.textContent = "Click ";

    const strong4 = document.createElement("strong");
    strong4.textContent = "Confirm";
    message2.appendChild(strong4);
    message2.appendChild(
      document.createTextNode(" to permanently delete all data, or ")
    );

    const strong5 = document.createElement("strong");
    strong5.textContent = "Cancel";
    message2.appendChild(strong5);
    message2.appendChild(document.createTextNode(" to keep everything."));

    modal.show({
      title: "Are You Absolutely Sure?",
      subtitle: "Last chance to cancel",
      message: message2,
      confirmText: "Confirm",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: async () => {
        const data = await getStorage(STORAGE_KEYS.ONBOARDING_COMPLETED);
        const onboardingCompleted = data.onboardingCompleted || false;

        await clearStorage();

        // Restore onboarding status
        await setStorage({
          [STORAGE_KEYS.ONBOARDING_COMPLETED]: onboardingCompleted,
          [STORAGE_KEYS.OPTIONS]: DEFAULT_OPTIONS,
        });

        showToast("All data cleared!");

        // Reload options and notify
        await this.loadOptions();
        this.onDataCleared?.();
      },
    });
  }
}
