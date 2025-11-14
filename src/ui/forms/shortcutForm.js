/**
 * Shortcut Form Handler
 * Manages the shortcut creation/editing form
 */

import {
  saveShortcut,
  getShortcut,
  checkDuplicate,
  replaceShortcut,
} from "../../modules/shortcuts/shortcutManager.js";
import { generateShortcutName } from "../../modules/shortcuts/shortcutGenerator.js";
import { showToast } from "../components/toast.js";

export class ShortcutForm {
  constructor() {
    this.form = document.getElementById("alias-form");
    this.aliasInput = document.getElementById("alias-name");
    this.urlInput = document.getElementById("alias-url");
    this.submitBtn = document.getElementById("submit-btn");
    this.duplicateWarning = document.getElementById("duplicate-warning");
    this.duplicateUrl = document.getElementById("duplicate-url");
    this.autoSuggestBtn = document.getElementById("auto-suggest-btn");

    this.editingIndex = null;

    this.init();
  }

  init() {
    // Setup form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Setup auto-suggest
    if (this.autoSuggestBtn) {
      this.autoSuggestBtn.addEventListener("click", () =>
        this.handleAutoSuggest()
      );
    }

    // Setup duplicate detection
    this.aliasInput.addEventListener("input", () => this.checkForDuplicate());
  }

  async handleSubmit(e) {
    e.preventDefault();

    const alias = this.aliasInput.value.trim().toLowerCase();
    const url = this.urlInput.value.trim();

    // Check if in replace mode
    if (this.submitBtn.classList.contains("replace-mode")) {
      const duplicate = await checkDuplicate(alias, this.editingIndex);
      if (duplicate.isDuplicate) {
        await replaceShortcut(duplicate.duplicateIndex, alias, url);

        // If we were editing a different shortcut, remove it
        if (
          this.editingIndex !== null &&
          this.editingIndex !== duplicate.duplicateIndex
        ) {
          const { deleteShortcut } = await import(
            "../../modules/shortcuts/shortcutManager.js"
          );
          const indexToRemove =
            this.editingIndex > duplicate.duplicateIndex
              ? this.editingIndex
              : this.editingIndex;
          await deleteShortcut(indexToRemove);
        }

        showToast(`Shortcut "${alias}" replaced!`);
        this.reset();
        this.onSave?.();
        return;
      }
    }

    // Normal save
    const result = await saveShortcut(alias, url, this.editingIndex);

    if (result.success) {
      showToast(result.message);
      this.reset();
      this.onSave?.();
    } else if (result.duplicate) {
      showToast(result.message, "info");
    }
  }

  async handleAutoSuggest() {
    const url = this.urlInput.value.trim();

    if (!url) {
      showToast("Please enter a URL first", "info");
      this.urlInput.focus();
      return;
    }

    const suggestion = generateShortcutName(url);

    if (suggestion) {
      this.aliasInput.value = suggestion;
      this.aliasInput.focus();
      this.aliasInput.select();
      showToast(`Suggested: "${suggestion}"`, "success");
      await this.checkForDuplicate();
    } else {
      showToast("Could not generate a suggestion from this URL", "info");
    }
  }

  async checkForDuplicate() {
    const alias = this.aliasInput.value.trim().toLowerCase();

    if (!alias) {
      this.hideDuplicateWarning();
      return;
    }

    const duplicate = await checkDuplicate(alias, this.editingIndex);

    if (duplicate.isDuplicate) {
      this.showDuplicateWarning(duplicate.existingUrl);
    } else {
      this.hideDuplicateWarning();
    }
  }

  showDuplicateWarning(existingUrl) {
    this.duplicateWarning.style.display = "flex";
    this.duplicateUrl.textContent = existingUrl;
    this.submitBtn.textContent = "Replace Anyway";
    this.submitBtn.classList.add("replace-mode");
  }

  hideDuplicateWarning() {
    this.duplicateWarning.style.display = "none";
    this.duplicateUrl.textContent = "";
    this.submitBtn.classList.remove("replace-mode");
    this.submitBtn.textContent =
      this.editingIndex !== null ? "Update Shortcut" : "Create Shortcut";
  }

  async loadForEdit(index) {
    const shortcut = await getShortcut(index);

    if (shortcut) {
      this.aliasInput.value = shortcut.alias;
      this.urlInput.value = shortcut.url;
      this.editingIndex = index;
      this.submitBtn.textContent = "Update Shortcut";
      await this.checkForDuplicate();
    }
  }

  prefillUrl(url) {
    this.urlInput.value = url;
    this.aliasInput.focus();
  }

  prefillAlias(alias) {
    this.aliasInput.value = alias;
  }

  reset() {
    this.form.reset();
    this.editingIndex = null;
    this.submitBtn.textContent = "Create Shortcut";
    this.submitBtn.disabled = false;
    this.submitBtn.classList.remove("replace-mode");
    this.hideDuplicateWarning();
  }
}
