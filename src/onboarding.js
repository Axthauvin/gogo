// Onboarding functions
function showOnboarding() {
  document.getElementById("onboarding-overlay").classList.remove("hidden");
}

function hideOnboarding() {
  document.getElementById("onboarding-overlay").classList.add("hidden");
}

function nextOnboardingStep() {
  const steps = document.querySelectorAll(".onboarding-step");
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

function finishOnboarding() {
  // Save all selected shortcuts
  saveSelectedShortcuts();

  // Mark onboarding as completed
  storage.local.set({ onboardingCompleted: true });

  hideOnboarding();

  // Show success message
  showToast(
    `${selectedShortcuts.length} shortcuts created! Try typing "go ${selectedShortcuts[0].alias}" in your address bar.`
  );
}

function saveSelectedShortcuts() {
  storage.local.get("aliases").then((data) => {
    const items = data.aliases || [];
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
