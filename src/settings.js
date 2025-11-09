// Utility to get storage API for both Chrome and Firefox
const storage =
  (typeof browser !== "undefined" && browser.storage) || chrome.storage;

// Store the index of the shortcut being edited (null if creating new)
let editingIndex = null;

// Check if onboarding has been completed
document.addEventListener("DOMContentLoaded", () => {
  storage.local.get("onboardingCompleted").then((data) => {
    if (!data.onboardingCompleted) {
      // Check saved onboarding step
      storage.local.get("onboardingStep").then((stepData) => {
        if (stepData.onboardingStep) {
          currentStep = stepData.onboardingStep;
          const createdAlias = readAskCreation();
          if (currentStep == 3)
            finishOnboarding(createdAlias); // This is the last step
          else showOnboarding(currentStep);
        } else {
          showOnboarding();
        }
      });
    } else {
      hideOnboarding();
    }
  });

  // Setup shortcut card listeners
  setupShortcutCards();

  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".section");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetSection = item.getAttribute("data-section");

      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      // Show target section
      sections.forEach((section) => section.classList.remove("active"));
      document
        .getElementById(`${targetSection}-section`)
        .classList.add("active");

      // Reset editing state when switching sections
      if (targetSection !== "create") {
        editingIndex = null;
        const submitBtn = document.querySelector(
          '#alias-form button[type="submit"]'
        );
        if (submitBtn) {
          submitBtn.textContent = "Create Shortcut";
          // Clear form
          document.getElementById("alias-form").reset();
        }
      }

      // Reload aliases if switching to list view
      if (targetSection === "list") {
        loadAliases();
      }
    });
  });

  loadAliases();
  handleQueryParams();
  setupExportImport();
  setupSearch();
});

// Setup export/import functionality
function setupExportImport() {
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");

  exportBtn.addEventListener("click", exportShortcuts);
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", importShortcuts);
}

// Export shortcuts to JSON file
function exportShortcuts() {
  storage.local.get("aliases").then((data) => {
    const items = data.aliases || [];

    if (items.length === 0) {
      showToast("No shortcuts to export!");
      return;
    }

    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gogo-shortcuts-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      `${items.length} shortcut${
        items.length !== 1 ? "s" : ""
      } exported successfully!`
    );
  });
}

// Import shortcuts from JSON file
function importShortcuts(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedShortcuts = JSON.parse(e.target.result);

      if (!Array.isArray(importedShortcuts)) {
        showToast("Invalid file format!");
        return;
      }

      // Validate shortcuts structure
      const validShortcuts = importedShortcuts.filter(
        (item) => item && typeof item === "object" && item.alias && item.url
      );

      if (validShortcuts.length === 0) {
        showToast("No valid shortcuts found in file!");
        return;
      }

      // Merge with existing shortcuts (avoid duplicates)
      storage.local.get("aliases").then((data) => {
        const existingItems = data.aliases || [];
        const existingAliases = new Set(
          existingItems.map((item) => item.alias)
        );

        const newShortcuts = validShortcuts.filter(
          (item) => !existingAliases.has(item.alias)
        );

        if (newShortcuts.length === 0) {
          showToast("All shortcuts already exist!");
          return;
        }

        const mergedItems = [...existingItems, ...newShortcuts];
        storage.local.set({ aliases: mergedItems }).then(() => {
          loadAliases();
          showToast(
            `${newShortcuts.length} shortcut${
              newShortcuts.length !== 1 ? "s" : ""
            } imported successfully!`
          );
        });
      });
    } catch (error) {
      showToast("Error reading file. Please check the file format.");
      console.error("Import error:", error);
    }
  };
  reader.readAsText(file);

  // Reset file input
  event.target.value = "";
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    filterShortcuts(e.target.value.toLowerCase());
  });
}

// Filter shortcuts based on search query
function filterShortcuts(query) {
  storage.local.get("aliases").then((data) => {
    const items = data.aliases || [];

    if (items.length === 0) {
      return;
    }

    if (query.trim() === "") {
      displayShortcuts(items);
      return;
    }

    // Filter and keep original indices
    const filteredItems = items
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter(
        ({ alias, url }) =>
          alias.toLowerCase().includes(query) ||
          url.toLowerCase().includes(query)
      );

    displayShortcuts(filteredItems, true);
  });
}

// Display shortcuts (used by both loadAliases and filterShortcuts)
function displayShortcuts(items, useOriginalIndex = false) {
  const aliasList = document.getElementById("alias-list");
  aliasList.innerHTML = "";

  if (items.length === 0) {
    const searchInput = document.getElementById("search-input");
    const isSearching = searchInput && searchInput.value.trim() !== "";

    aliasList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <img src="./icons/list.svg" width="80" height="80" alt="No shortcuts" />
        </div>
        <div class="empty-text">${
          isSearching ? "No shortcuts found" : "No shortcuts yet"
        }</div>
        <div class="empty-subtext">${
          isSearching
            ? "Try adjusting your search terms to find what you're looking for."
            : "Create your first shortcut to quickly jump to your favorite websites."
        }</div>
        ${
          !isSearching
            ? `<button class="empty-action" id="create-first-shortcut">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Create Your First Shortcut
              </button>`
            : ""
        }
      </div>
    `;

    // Add event listener for the button if it exists
    if (!isSearching) {
      const createBtn = document.getElementById("create-first-shortcut");
      if (createBtn) {
        createBtn.addEventListener("click", () => {
          document.querySelector('.nav-item[data-section="create"]').click();
        });
      }
    }

    return;
  }

  items.forEach((item, index) => {
    const { alias, url } = item;
    const dataIndex = useOriginalIndex ? item.originalIndex : index;

    const aliasItem = document.createElement("div");
    aliasItem.className = "alias-item";
    aliasItem.setAttribute("data-url", url);
    aliasItem.innerHTML = `
      <div class="alias-info">
        <div class="alias-name">${escapeHtml(alias)}</div>
        <div class="alias-target">${escapeHtml(url)}</div>
      </div>
      <div class="alias-actions">
        <button class="action-btn edit-btn" data-index="${dataIndex}" title="Edit">
          <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="action-btn delete-btn" data-index="${dataIndex}" title="Delete">
          <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6.98996C8.81444 4.87965 15.1856 4.87965 21 6.98996" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8.00977 5.71997C8.00977 4.6591 8.43119 3.64175 9.18134 2.8916C9.93148 2.14146 10.9489 1.71997 12.0098 1.71997C13.0706 1.71997 14.0881 2.14146 14.8382 2.8916C15.5883 3.64175 16.0098 4.6591 16.0098 5.71997" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 13V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 9.98999L18.33 17.99C18.2225 19.071 17.7225 20.0751 16.9246 20.8123C16.1266 21.5494 15.0861 21.9684 14 21.99H10C8.91389 21.9684 7.87336 21.5494 7.07541 20.8123C6.27745 20.0751 5.77745 19.071 5.67001 17.99L5 9.98999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
    aliasList.appendChild(aliasItem);
  });

  // Add click event to alias items (not on buttons)
  document.querySelectorAll(".alias-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      // Don't open if clicking on action buttons
      if (e.target.closest(".alias-actions")) {
        return;
      }
      const url = item.getAttribute("data-url");
      if (url) {
        window.open(url, "_blank");
      }
    });
  });

  // Add event listeners for edit and delete buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering the item click
      const btn = e.currentTarget;
      const index = parseInt(btn.getAttribute("data-index"));
      editAlias(index);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering the item click
      const index = parseInt(e.target.getAttribute("data-index"));
      deleteAlias(index);
    });
  });
}

// Load existing aliases
function loadAliases() {
  storage.local.get("aliases").then((data) => {
    const items = data.aliases || [];
    displayShortcuts(items);
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Edit alias
function editAlias(index) {
  storage.local.get("aliases").then((data) => {
    const items = data.aliases || [];
    const alias = items[index];
    if (alias) {
      // Switch to create section
      document.querySelector('.nav-item[data-section="create"]').click();

      // Fill form
      document.getElementById("alias-name").value = alias.alias;
      document.getElementById("alias-url").value = alias.url;

      // Store the index for deletion when form is submitted
      editingIndex = index;

      // Update button text to indicate editing
      const submitBtn = document.querySelector(
        '#alias-form button[type="submit"]'
      );
      submitBtn.textContent = "Update Shortcut";
    }
  });
}

// Delete alias
function deleteAlias(index, shouldReload = true) {
  storage.local.get("aliases").then((data) => {
    const items = data.aliases || [];
    items.splice(index, 1);
    storage.local.set({ aliases: items }).then(() => {
      if (shouldReload) {
        loadAliases();
      }
    });
  });
}

// Handle query parameters
function handleQueryParams() {
  const params = new URLSearchParams(window.location.search);

  // Handle section parameter
  const section = params.get("section");
  if (section === "list") {
    document.querySelector('.nav-item[data-section="list"]').click();
    return;
  }

  // Handle URL parameter (pre-fill URL field)
  const url = params.get("url");
  if (url) {
    document.getElementById("alias-url").value = url;
    // Focus on alias name field
    document.getElementById("alias-name").focus();
  }

  // Handle create parameter (pre-fill alias name)
  const createAlias = params.get("create");
  if (createAlias) {
    document.getElementById("alias-name").value = createAlias;
  }
}

// Save new alias
document.getElementById("alias-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const alias = document.getElementById("alias-name").value;
  const url = document.getElementById("alias-url").value;
  storage.local.get("aliases").then((data) => {
    const items = data.aliases || [];

    // If editing, delete the old one first
    if (editingIndex !== null) {
      items.splice(editingIndex, 1);
      editingIndex = null; // Reset editing state
    }

    items.push({
      alias: alias.trim().toLowerCase(),
      url: url.trim().toLowerCase(),
    });
    storage.local.set({ aliases: items }).then(() => {
      loadAliases();
      showToast(`Shortcut "${alias}" saved!`);
      // Clear form
      document.getElementById("alias-form").reset();

      // Reset button text
      const submitBtn = document.querySelector(
        '#alias-form button[type="submit"]'
      );
      submitBtn.textContent = "Create Shortcut";
    });
  });
});

// Toast notification
function showToast(message) {
  const toast = document.getElementById("toast");

  toast.querySelector(".toast-title").textContent = "Success";
  toast.querySelector(".toast-message").textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function readAskCreation() {
  const params = new URLSearchParams(window.location.search);
  console.log("URL Params:", params);
  const created = params.get("create");
  console.log("Asked creation for alias:", created);
  return created;
}
