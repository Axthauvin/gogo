/**
 * Toast Notification Component
 * Displays temporary notifications to the user
 */

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, info, error)
 */
export function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  if (!toast) {
    console.error("Toast element not found");
    return;
  }

  const title =
    type === "info" ? "Info" : type === "error" ? "Error" : "Success";

  const titleElement = toast.querySelector(".toast-title");
  const messageElement = toast.querySelector(".toast-message");

  if (titleElement) {
    titleElement.textContent = title;
  }

  if (messageElement) {
    messageElement.textContent = message;
  }

  // Add type class for styling
  toast.className = "toast-container";
  toast.classList.add("show", type);

  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/**
 * Hide the toast immediately
 */
export function hideToast() {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.classList.remove("show");
  }
}
