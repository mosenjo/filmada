import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const types = { ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" };
const port = Number(process.env.PORT ?? 4173);
createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  let target = path.join(root, pathname);
  if (existsSync(target) && statSync(target).isDirectory()) target = path.join(target, "index.html");
  if (!existsSync(target)) target = path.join(root, "404.html");
  if (!existsSync(target)) { response.writeHead(404); response.end("Not found"); return; }
  response.setHeader("Content-Type", types[path.extname(target)] ?? "text/html; charset=utf-8");
  response.end(readFileSync(target));
}).listen(port, "127.0.0.1", () => console.log(`Filmada is available at http://127.0.0.1:${port}`));
