# GoGo

A browser extension that lets you create custom shortcuts to your favorite websites.

![Create a new shortcut](images/create.png)

## What does it do?

Type **`go`** + **`space`** + **`your-shortcut`** in the address bar to instantly jump to any URL you've saved.

## Quick Start

1. Install the extension
2. Create a shortcut (e.g., `gmail` → `https://mail.google.com`)
3. Type `go gmail` in your address bar
4. Press Enter

## Screenshots

![View Shortcuts](images/aliases.png)

## Installation

### Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist-chrome` folder

### Firefox

1. Download the file **`gogo-firefox.xpi`** from the [latest release](https://github.com/Axthauvin/gogo/releases/latest).
2. In Firefox, simply **drag and drop** the `.xpi` file into an open browser window.
3. Confirm the installation prompt.

That's it, GoGo is ready to use!

> ✅ The Firefox extension is **officially signed** by Mozilla and can be installed directly without any configuration changes.

---

## Build

```bash
node build.js all
```

Made with ❤️ by Axel
