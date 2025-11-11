/**
 * Modal Component
 * Reusable modal system for confirmations and dialogs
 */

export class Modal {
  constructor() {
    this.overlay = null;
    this.onConfirm = null;
  }

  /**
   * Initialize the modal
   */
  init() {
    this.overlay = document.getElementById("modal-overlay");
    const cancelBtn = document.getElementById("modal-cancel");
    const confirmBtn = document.getElementById("modal-confirm");

    // Close on overlay click
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on cancel
    cancelBtn.addEventListener("click", () => this.close());

    // Confirm action
    confirmBtn.addEventListener("click", () => {
      const callback = this.onConfirm;
      this.onConfirm = null;
      this.close();

      // Execute callback after closing to allow chaining modals
      if (callback) {
        setTimeout(() => callback(), 100);
      }
    });

    // ESC key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.overlay.classList.contains("show")) {
        this.close();
      }
    });
  }

  /**
   * Show the modal
   * @param {Object} config - Modal configuration
   * @param {string} config.title - Modal title
   * @param {string} config.subtitle - Modal subtitle (optional)
   * @param {string|HTMLElement} config.message - Modal message content
   * @param {string} config.confirmText - Confirm button text
   * @param {string} config.cancelText - Cancel button text
   * @param {string} config.type - Modal type (danger, warning, info, success)
   * @param {Function} config.onConfirm - Callback when confirmed
   */
  show({
    title,
    subtitle = "",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    onConfirm,
  }) {
    this.onConfirm = onConfirm;

    // Set content
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-subtitle").textContent = subtitle;

    // Safely set message content
    const modalMessage = document.getElementById("modal-message");
    modalMessage.textContent = ""; // Clear existing content

    if (typeof message === "string") {
      // Strip HTML tags for security
      modalMessage.textContent = message.replace(/<[^>]*>/g, "");
    } else if (message instanceof HTMLElement) {
      // If message is already a DOM element, append it
      modalMessage.appendChild(message);
    }

    document.getElementById("modal-confirm").textContent = confirmText;
    document.getElementById("modal-cancel").textContent = cancelText;

    // Set icon based on type
    const iconContainer = document.getElementById("modal-icon");
    const iconSvg = document.getElementById("modal-icon-svg");
    const confirmBtn = document.getElementById("modal-confirm");

    // Remove all type classes
    iconContainer.className = "modal-icon";
    confirmBtn.className = "modal-btn modal-btn-confirm";

    // Add type class
    iconContainer.classList.add(type);
    confirmBtn.classList.add(type);

    // Set icon SVG
    this._setIcon(iconSvg, type);

    // Show modal
    this.overlay.classList.add("show");
  }

  /**
   * Close the modal
   */
  close() {
    this.overlay.classList.remove("show");
    this.onConfirm = null;
  }

  /**
   * Set the modal icon based on type
   * @private
   */
  _setIcon(iconSvg, type) {
    const icons = {
      danger: {
        d: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z",
      },
      warning: {
        d: "M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z",
      },
      info: {
        d: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z",
      },
      success: {
        d: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",
      },
    };

    // Clear existing SVG content
    while (iconSvg.firstChild) {
      iconSvg.removeChild(iconSvg.firstChild);
    }

    const iconData = icons[type] || icons.info;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", iconData.d);
    path.setAttribute("fill", "currentColor");
    iconSvg.appendChild(path);
  }
}

// Export a singleton instance
export const modal = new Modal();
