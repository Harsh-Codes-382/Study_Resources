// Scans public/<X>_Notes/ folders and writes src/notes-manifest.json.
// Run automatically before dev/build (see package.json scripts), or manually:
//   npm run manifest
//
// You never hand-list notes: drop a .md or .pdf into a *_Notes folder and
// re-run. Titles/ids are derived from the filename.

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname, basename, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");
const OUT_FILE = join(__dirname, "..", "src", "notes-manifest.json");

const NOTE_EXT = new Set([".md", ".pdf"]);
const ORDER = ["aws", "ai-engineering", "hld", "lld"]; // preferred card order; others follow

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

// "LLM_Notes" -> "LLM", "LLM_API_and_Prompt_Engineering" -> "LLM API and Prompt Engineering"
const nameFromFolder = (folder) =>
  folder
    .replace(/_Notes$/i, "")
    .replace(/[_]+/g, " ")
    .trim();
const idFromFolder = (folder) =>
  nameFromFolder(folder)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Every segment is URL-encoded so folders/files with spaces or "&" (e.g.
// "How LLM Works", "LLM API & Prompt Engineering") still fetch correctly.
const encodePath = (relPath) =>
  "/" + relPath.split("/").map(encodeURIComponent).join("/");

const toManifestPath = (absoluteFilePath) =>
  encodePath(relative(PUBLIC_DIR, absoluteFilePath).replace(/\\/g, "/"));

const toCategoryPath = (absoluteDirPath) => {
  const relPath = relative(PUBLIC_DIR, absoluteDirPath).replace(/\\/g, "/");
  return relPath ? encodePath(relPath) : "/";
};

const listNoteFiles = (dirPath) =>
  readdirSync(dirPath)
    .filter((entry) => {
      try {
        const fullPath = join(dirPath, entry);
        return statSync(fullPath).isFile() && NOTE_EXT.has(extname(entry).toLowerCase());
      } catch {
        return false;
      }
    })
    .sort();

const hasNotesOrSubcategories = (dirPath) => {
  try {
    const entries = readdirSync(dirPath);
    return entries.some((entry) => {
      const fullPath = join(dirPath, entry);
      try {
        if (statSync(fullPath).isDirectory()) {
          return hasNotesOrSubcategories(fullPath);
        }
        return statSync(fullPath).isFile() && NOTE_EXT.has(extname(entry).toLowerCase());
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
};

const buildCategory = (dirPath) => {
  const folder = basename(dirPath);
  const name = nameFromFolder(folder);
  const id = idFromFolder(folder);

  const notes = listNoteFiles(dirPath).map((file) => ({
    id: idFromFile(file),
    title: titleFromFile(file),
    type: extname(file).slice(1).toLowerCase(),
    file,
    path: toManifestPath(join(dirPath, file)),
  }));

  const childDirs = readdirSync(dirPath)
    .filter((entry) => {
      const fullPath = join(dirPath, entry);
      try {
        return statSync(fullPath).isDirectory() && hasNotesOrSubcategories(fullPath);
      } catch {
        return false;
      }
    })
    .sort();

  const categories = childDirs.map((entry) => buildCategory(join(dirPath, entry)));

  return {
    id,
    name,
    folder,
    path: toCategoryPath(dirPath),
    notes,
    categories,
  };
};

const sortCategory = (category) => {
  category.notes.sort((a, b) => a.file.localeCompare(b.file));

  category.categories.sort((a, b) => {
    const ia = ORDER.indexOf(a.id);
    const ib = ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.name.localeCompare(b.name);
  });

  category.categories.forEach(sortCategory);
  return category;
};

const countNotes = (category) =>
  category.notes.length + category.categories.reduce((total, child) => total + countNotes(child), 0);

const categories = [];

for (const entry of readdirSync(PUBLIC_DIR)) {
  const fullPath = join(PUBLIC_DIR, entry);
  if (!/_Notes$/i.test(entry) || !statSync(fullPath).isDirectory()) continue;

  const category = buildCategory(fullPath);
  categories.push(sortCategory(category));
}

categories.sort((a, b) => {
  const ia = ORDER.indexOf(a.id);
  const ib = ORDER.indexOf(b.id);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.name.localeCompare(b.name);
});

writeFileSync(OUT_FILE, JSON.stringify(categories, null, 2) + "\n");

const totalNotes = categories.reduce((n, category) => n + countNotes(category), 0);
console.log(`manifest: ${categories.length} categories, ${totalNotes} notes -> src/notes-manifest.json`);