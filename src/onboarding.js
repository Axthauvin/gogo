const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Onboarding state
let selectedShortcuts = [];
let currentStep = 1;

// Onboarding functions
function showOnboarding(step = null) {
  document.getElementById("onboarding-overlay").classList.remove("hidden");
  if (step) {
    nextOnboardingStep();
  }
}

function hideOnboarding() {
  document.getElementById("onboarding-overlay").classList.add("hidden");
}

function nextOnboardingStep() {
  const steps = document.querySelectorAll(".onboarding-step");
  console.log("Current onboarding step:", currentStep);
  console.log("Steps available:", steps);

  steps[currentStep - 1].classList.remove("active");

  currentStep++;

  if (currentStep <= steps.length) {
    steps[currentStep - 1].classList.add("active");

    // Update the first shortcut name in step 3
    if (currentStep === 3 && selectedShortcuts.length > 0) {
      document.getElementById("first-shortcut").textContent =
        selectedShortcuts[0].alias;
    }
  }

  // Save progress after each step
  storage.local.set({ onboardingStep: currentStep });
}

function setupShortcutCards() {
  const cards = document.querySelectorAll(".shortcut-card:not(.custom-card)");
  const continueBtn = document.getElementById("continue-btn");
  const selectedCount = document.getElementById("selected-count");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const alias = card.getAttribute("data-alias");
      const url = card.getAttribute("data-url");

      if (card.classList.contains("selected")) {
        // Deselect
        card.classList.remove("selected");
        selectedShortcuts = selectedShortcuts.filter((s) => s.alias !== alias);
      } else {
        // Select
        card.classList.add("selected");
        selectedShortcuts.push({ alias, url });
      }

      // Save selected shortcuts in onboarding state
      storage.local.set({ selectedShortcuts });

      // Update button state
      selectedCount.textContent = selectedShortcuts.length;
      continueBtn.disabled = selectedShortcuts.length === 0;
    });
  });
}

function customShortcut() {
  // Save selected shortcuts first
  if (selectedShortcuts.length > 0) {
    saveSelectedShortcuts();
  }

  // Mark onboarding as completed
  storage.local.set({ onboardingCompleted: true });
  hideOnboarding();

  // Switch to create section
  document.querySelector('.nav-item[data-section="create"]').click();
}

function finishOnboarding(askedAlias = null) {
  // Load selectedShortcuts from storage in case of page reload
  storage.local.get("selectedShortcuts").then((data) => {
    console.log("Loaded selectedShortcuts from storage:", data);
    if (data.selectedShortcuts) {
      selectedShortcuts = data.selectedShortcuts;
    }

    // Save all selected shortcuts
    saveSelectedShortcuts();

    // Mark onboarding as completed
    storage.local.set({ onboardingCompleted: true });

    hideOnboarding();

    // Show success message
    showToast(
      `${selectedShortcuts.length} shortcuts created! Try typing "go ${selectedShortcuts[0].alias}" in your address bar.`
    );

    // If there are created aliases from URL params redirect to it
    if (askedAlias) {
      const foundAlias = selectedShortcuts.find((s) => s.alias === askedAlias);

      if (foundAlias) {
        // Navigate to aliases list
        document.querySelector('.nav-item[data-section="list"]').click();

        // Open the created alias page
        const targetUrl = foundAlias.url;
        browserAPI.tabs.create({ url: targetUrl });
      }
    }
  });
}

function saveSelectedShortcuts() {
  storage.local.get("aliases").then((data) => {
    const items = data && data.aliases ? data.aliases : [];
    selectedShortcuts.forEach((shortcut) => {
      // Check if alias doesn't already exist
      if (!items.find((item) => item.alias === shortcut.alias)) {
        items.push(shortcut);
      }
    });
    storage.local.set({ aliases: items }).then(() => {
      loadAliases();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Setup onboarding button listeners
  document
    .getElementById("continue-btn")
    .addEventListener("click", nextOnboardingStep);
  document
    .getElementById("custom-shortcut-btn")
    .addEventListener("click", customShortcut);
  document
    .getElementById("finish-btn")
    .addEventListener("click", finishOnboarding);

  document.querySelectorAll(".btn-onboarding").forEach((btn) => {
    if (btn.id === "continue-btn" || btn.id === "finish-btn") return;
    btn.addEventListener("click", () => {
      nextOnboardingStep();
    });
  });
});
