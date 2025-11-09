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
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist-chrome` folder

### Firefox

1. Download the file **`gogo-firefox.xpi`** from the latest release.
2. In Firefox, simply **drag and drop** the `.xpi` file into an open browser window.
3. Confirm the installation prompt.

That’s it, GoGo is ready to use!

#### Signature issue

If Firefox blocks installation because the extension is **unsigned**, you can temporarily allow unsigned extensions:

1. Open a new tab and visit `about:config`
2. Search for the preference: `xpinstall.signatures.required`
3. Set it to `false`
4. Try installing the `.xpi` file again (drag-and-drop or open the file in Firefox)

> ⚠️ **Warning:** disabling signature checks lowers your browser’s security.  
> Only do this for local testing or development. Prefer official signed versions whenever possible.

---

## Build

```bash
node build.js all
```

Made with ❤️ by Axel
