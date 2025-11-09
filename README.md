# GoGo

A browser extension that lets you create custom shortcuts to your favorite websites.

![Create a new alias](images/create.png)

## What does it do?

Type **`go`** + **`space`** + **`your-alias`** in the address bar to instantly jump to any URL you've saved.

## Quick Start

1. Install the extension
2. Create an alias (e.g., `gmail` → `https://mail.google.com`)
3. Type `go gmail` in your address bar
4. Press Enter

## Screenshots

![View Aliases](images/aliases.png)

## Installation

### Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist-chrome` folder

### Firefox via the provided .xpi

You can install the packaged extension directly using the generated `.xpi` file (this is a ZIP archive with an `.xpi` extension). After a build or from a release artifact you'll have a `gogo-firefox.xpi` file.

Steps:

- Download or host `gogo-firefox.xpi` from the last release.
- In Firefox, either drag-and-drop the `.xpi` file onto a Firefox window, or open the `.xpi` URL directly in the address bar (paste the raw asset URL and press Enter).
- Follow Firefox's install prompts.

Note about signing: if Firefox blocks installation because the extension is unsigned, you may need to toggle the following (developer-only / unsupported):

1. Open [about:config](about:config) in Firefox
2. Search for [xpinstall.signatures.required](xpinstall.signatures.required)
3. Set it to `false`

> ⚠️ Warning: disabling signature checks reduces extension security and is not recommended for everyday browsing. Prefer installing signed extensions from official channels when available.

## Build

```bash
node build.js all
```
