// Scans public/<X>_Notes/ folders and writes src/notes-manifest.json.
// Run automatically before dev/build (see package.json scripts), or manually:
//   npm run manifest
//
// You never hand-list notes: drop a .md or .pdf into a *_Notes folder and
// re-run. Titles/ids are derived from the filename.

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");
const OUT_FILE = join(__dirname, "..", "src", "notes-manifest.json");

const NOTE_EXT = new Set([".md", ".pdf"]);
const ORDER = ["aws", "llm", "hld", "lld"]; // preferred card order; others follow

// "01_AWS_Global_Infrastructure.md" -> "AWS Global Infrastructure"
const titleFromFile = (file) =>
  basename(file, extname(file))
    .replace(/^\d+[_\-.\s]*/, "") // drop leading "01_" / "01-" / "01 "
    .replace(/[_\-]+/g, " ")
    .trim();

// "01_AWS_Global_Infrastructure.md" -> "01-aws-global-infrastructure"
const idFromFile = (file) =>
  basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categories = [];

for (const entry of readdirSync(PUBLIC_DIR)) {
  if (!/_Notes$/i.test(entry)) continue; // only folders like AWS_Notes
  const dir = join(PUBLIC_DIR, entry);
  if (!statSync(dir).isDirectory()) continue;

  const name = entry.replace(/_Notes$/i, ""); // "AWS"
  const id = name.toLowerCase(); // "aws"

  const files = readdirSync(dir)
    .filter((f) => {
      try {
        return (
          statSync(join(dir, f)).isFile() &&
          NOTE_EXT.has(extname(f).toLowerCase())
        );
      } catch {
        return false;
      }
    })
    .sort(); // zero-padded prefixes sort naturally (01..24)

  const notes = files.map((file) => ({
    id: idFromFile(file),
    title: titleFromFile(file),
    type: extname(file).slice(1).toLowerCase(), // "md" | "pdf"
    file,
    path: `/${entry}/${encodeURIComponent(file)}`,
  }));

  categories.push({ id, name, folder: entry, notes });
}

categories.sort((a, b) => {
  const ia = ORDER.indexOf(a.id);
  const ib = ORDER.indexOf(b.id);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
});

writeFileSync(OUT_FILE, JSON.stringify(categories, null, 2) + "\n");

const totalNotes = categories.reduce((n, c) => n + c.notes.length, 0);
console.log(
  `manifest: ${categories.length} categories, ${totalNotes} notes -> src/notes-manifest.json`
);
