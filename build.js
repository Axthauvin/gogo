// build.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = process.argv[2]; // "chrome", "firefox" or "all"
if (!target || !["chrome", "firefox", "all"].includes(target)) {
  console.error("Usage: node build.js <chrome|firefox|all>");
  process.exit(1);
}

function buildTarget(targetName) {
  const srcManifest = path.join(__dirname, `manifest.${targetName}.json`);
  const outDir = path.join(__dirname, `dist-${targetName}`);
  const outManifest = path.join(outDir, "manifest.json");

  if (!fs.existsSync(srcManifest)) {
    console.error("Could not find manifest file for :", srcManifest);
    process.exit(2);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // copy manifest
  fs.copyFileSync(srcManifest, outManifest);

  // get all files from src/
  const srcDir = path.join(__dirname, "src");
  const files = fs.readdirSync(srcDir, {
    recursive: true,
  });

  const staticFiles = files.map((file) => path.join("src", file));
  for (const f of staticFiles) {
    const src = path.join(__dirname, f);
    const dest = path.join(outDir, f);

    if (fs.existsSync(src)) {
      // Only copy if it's a file, not a directory
      const stats = fs.statSync(src);
      if (stats.isFile()) {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, dest);
      }
    }
  }

  console.log(`Build ${targetName} finished → ${outDir}/manifest.json`);
}

if (target === "all") {
  buildTarget("chrome");
  buildTarget("firefox");
} else {
  buildTarget(target);
}
