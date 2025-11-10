const LOG_KEY = "urlWatcherLog";

const storage =
  (typeof browser !== "undefined" && browser.storage) || chrome.storage;

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// webNavigation - more granular navigation events
browserAPI.webNavigation.onCommitted.addListener(async (details) => {
  // filter subframes if you want: details.frameId === 0 is the top frame
  if (details.frameId === 0) {
    const entry = {
      when: new Date().toISOString(),
      type: "webNavigation.onCommitted",
      url: details.url,
      tabId: details.tabId,
      transitionType: details.transitionType,
    };
  }
});

// omnibox autocomplete - show suggestions as user types
browserAPI.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const query = (text || "").trim().toLowerCase();

  // Get options to check if autocomplete is enabled
  const data = await storage.local.get(["aliases", "options"]);
  const options = data.options || { enableAutocomplete: true };

  // If autocomplete is disabled, don't show suggestions
  if (options.enableAutocomplete === false) {
    browserAPI.omnibox.setDefaultSuggestion({
      description: "Type a shortcut name",
    });
    return;
  }

  const items = (data && data.aliases) || [];

  if (!query) {
    browserAPI.omnibox.setDefaultSuggestion({
      description: "Type a shortcut name",
    });
    return;
  }

  if (items.length === 0) {
    browserAPI.omnibox.setDefaultSuggestion({
      description: "No shortcuts created yet",
    });
    return;
  }

  // Find matching aliases
  const matches = items
    .filter((item) => item.alias.toLowerCase().includes(query))
    .slice(0, 10); // Limit to 10 suggestions

  if (matches.length === 0) {
    browserAPI.omnibox.setDefaultSuggestion({
      description: `Create new shortcut: <match>${text}</match>`,
    });
    suggest([]);
    return;
  }

  // Set the first match as the default suggestion (appears at top, highlighted)
  const firstMatch = matches[0];
  browserAPI.omnibox.setDefaultSuggestion({
    description: `<match>${firstMatch.alias}</match> → <url>${firstMatch.url}</url>`,
  });

  // Show remaining matches in dropdown
  const remainingMatches = matches.slice(1).map((item) => ({
    content: item.alias,
    description: `<match>${item.alias}</match> → <dim>${item.url}</dim>`,
  }));

  suggest(remainingMatches);
});

// omnibox handling: user types "go <something>" in the address bar
browserAPI.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const query = (text || "").trim();
  if (!query) return;

  // check stored aliases
  const data = await storage.local.get(["aliases", "options"]);
  const items = (data && data.aliases) || [];
  const options = data.options || { tabBehavior: "newTab" };

  const aliasEntry = items.find(
    (item) => item.alias === query.trim().toLowerCase()
  );

  let target;
  if (aliasEntry) {
    // found -> navigate to alias URL
    target = aliasEntry.url;
  } else {
    // not found -> open the creation/settings page for this alias
    target = `src/settings.html?create=${encodeURIComponent(query)}`;
  }

  // Get current tab
  const tabs = await browserAPI.tabs.query({
    active: true,
    currentWindow: true,
  });
  const currentTab = tabs[0];
  const currentUrl = currentTab?.url || "";

  // Determine if we should replace or create new tab
  const isNewTabPage =
    currentUrl === "" ||
    currentUrl === "about:newtab" ||
    currentUrl === "chrome://newtab/" ||
    currentUrl === "about:blank" ||
    currentUrl.startsWith("chrome://") ||
    currentUrl.startsWith("about:");

  const isExtensionPage =
    currentUrl.includes("src/settings.html") ||
    currentUrl.includes("src/popup.html");

  // Replace tab if: new tab page, extension settings page, or user found an alias
  if (isNewTabPage || isExtensionPage) {
    await browserAPI.tabs.update(currentTab.id, { url: target });
  } else {
    // On regular webpage: respect user's tab behavior preference (only for found aliases)
    if (aliasEntry && options.tabBehavior === "replaceTab") {
      await browserAPI.tabs.update(currentTab.id, { url: target });
    } else {
      // Default: open in new tab
      await browserAPI.tabs.create({ url: target });
    }
  }
});

browserAPI.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Open the onboarding page in a new tab
    const settingsPath = browserAPI.runtime.getURL("src/settings.html");

    chrome.tabs.create({ url: settingsPath });
  }
});
