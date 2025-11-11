/**
 * Shortcut List Manager
 * Handles displaying and managing the list of shortcuts
 */

import {
  getAllShortcuts,
  deleteShortcut,
} from "../../modules/shortcuts/shortcutManager.js";
import { getStorage } from "../../core/storage.js";
import { STORAGE_KEYS } from "../../core/constants.js";
import { createShortcutCard } from "../components/shortcutCard.js";
import { createEmptyState } from "../components/emptyState.js";
import { showToast } from "../components/toast.js";
import { modal } from "../components/modal.js";

export class ShortcutList {
  constructor(listElement) {
    this.listElement = listElement;
  }

  async display(shortcuts = null, useOriginalIndex = false) {
    const items = shortcuts || (await getAllShortcuts());
    this.listElement.innerHTML = "";

    if (items.length === 0) {
      const searchInput = document.getElementById("search-input");
      const isSearching = searchInput && searchInput.value.trim() !== "";

      const emptyState = createEmptyState(isSearching, () => {
        document.querySelector('.nav-item[data-section="create"]')?.click();
      });

      this.listElement.appendChild(emptyState);
      return;
    }

    items.forEach((item, index) => {
      const dataIndex = useOriginalIndex ? item.originalIndex : index;
      const card = createShortcutCard(
        item,
        dataIndex,
        (idx) => this.onEdit?.(idx),
        (idx) => this.handleDelete(idx)
      );
      this.listElement.appendChild(card);
    });
  }

  async handleDelete(index) {
    const shortcuts = await getAllShortcuts();
    const shortcutToDelete = shortcuts[index];

    // Check if delete confirmation is enabled
    const data = await getStorage(STORAGE_KEYS.OPTIONS);
    const options = data.options || { confirmDelete: true };

    if (options.confirmDelete) {
      // Create message with highlighted alias name
      const messageEl = document.createElement("span");
      messageEl.textContent = "Are you sure you want to delete ";

      const highlightEl = document.createElement("span");
      highlightEl.className = "modal-highlight";
      highlightEl.textContent = shortcutToDelete.alias;

      messageEl.appendChild(highlightEl);
      messageEl.appendChild(document.createTextNode("?"));

      modal.show({
        title: "Delete Shortcut",
        subtitle: "This action cannot be undone",
        message: messageEl,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger",
        onConfirm: async () => {
          const result = await deleteShortcut(index);
          showToast(result.message);
          this.onDelete?.();
        },
      });
    } else {
      // Delete immediately without confirmation
      const result = await deleteShortcut(index);
      showToast(result.message);
      this.onDelete?.();
    }
  }

  async reload() {
    await this.display();
  }
}
