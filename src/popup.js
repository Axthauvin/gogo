const browserAPI = typeof browser !== "undefined" ? browser : chrome;

(async function () {
  // Get the current active tab URL
  const tabs = await browserAPI.tabs.query({
    active: true,
    currentWindow: true,
  });
  const currentTab = tabs[0];
  const currentUrl = currentTab?.url;

  // If page already is settings page, close popup
  if (
    currentUrl &&
    currentUrl.includes("src/settings.html") &&
    (currentUrl.startsWith("chrome:") ||
      currentUrl.startsWith("moz-extension:"))
  ) {
    window.close();
    return;
  }

  const settingsPath = browserAPI.runtime.getURL("src/settings.html");

  // Redirect to settings page
  if (
    currentUrl &&
    !currentUrl.startsWith("chrome:") &&
    !currentUrl.startsWith("moz-extension:") &&
    !currentUrl.startsWith("about:")
  ) {
    // Valid URL exists, go to create page with URL pre-filled
    browserAPI.tabs.create({
      url: `${settingsPath}?url=${encodeURIComponent(currentUrl)}`,
    });
  } else {
    // No valid URL, go to list page
    browserAPI.tabs.create({ url: `${settingsPath}?section=list` });
  }

  // Close the popup
  window.close();
})();
