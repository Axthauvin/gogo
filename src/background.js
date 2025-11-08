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

// omnibox handling: user types "go <something>" in the address bar
browserAPI.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const query = (text || "").trim();
  if (!query) return;

  // check stored aliases
  const data = await storage.local.get("aliases");
  const items = (data && data.aliases) || [];
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

  // open in new tab
  await browserAPI.tabs.create({ url: target });
});
