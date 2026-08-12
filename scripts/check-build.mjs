import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const errors = [];
let pageCount = 0;

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const file = path.join(directory, entry);
    if (statSync(file).isDirectory()) { walk(file); continue; }
    if (!file.endsWith(".html")) continue;
    pageCount += 1;
    const html = readFileSync(file, "utf8");
    if (!file.endsWith(path.join("admin", "index.html")) && !html.includes("<main id=\"content\">")) errors.push(`${file}: missing main content landmark`);
    if (!html.includes("<title>")) errors.push(`${file}: missing title`);
    for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
      const href = match[1].split(/[?#]/)[0];
      if (href === "/styles.css") continue;
      const target = path.join(root, href);
      const valid = existsSync(target) && (statSync(target).isFile() || existsSync(path.join(target, "index.html")));
      if (!valid) errors.push(`${file}: broken internal link ${href}`);
    }
  }
}

walk(root);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${pageCount} generated pages and their internal links.`);
