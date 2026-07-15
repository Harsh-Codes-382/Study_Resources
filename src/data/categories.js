// Merges the auto-generated file manifest with per-category presentation
// (icon, accent colour, blurb). To add a whole new category, just create a
// new folder like  public/DEVOPS_Notes/  and add a META entry keyed by its
// lowercase id ("devops"). Files inside are picked up automatically.
//
// Sub-folders nest recursively: public/LLM_Notes/RAG_Notes/*.md becomes a
// "rag" subcategory under "llm". Subcategories inherit their parent's accent
// (and a Folder icon) unless you give them their own META entry.

import { Cloud, Cpu, Network, Blocks, Database, Folder } from "lucide-react";
import generated from "../notes-manifest.json";

const META = {
  aws: {
    icon: Cloud,
    accent: "#f0a63c",
    blurb: "Cloud infra, deploys & production reliability",
  },
  "ai-engineering": {
    icon: Cpu,
    accent: "#a78bfa",
    blurb: "LLM internals, prompting & the AI engineer path",
  },
  hld: {
    icon: Network,
    accent: "#45c4e6",
    blurb: "High-level & distributed system design",
  },
  lld: {
    icon: Blocks,
    accent: "#4ade80",
    blurb: "Object modelling & low-level design",
  },
  os: {
    icon: Cpu,
    accent: "#c084fc",
    blurb: "Kernel, scheduling, memory & concurrency",
  },
  cn: {
    icon: Network,
    accent: "#38bdf8",
    blurb: "OSI, TCP/IP, protocols & the wire",
  },
  dbms: {
    icon: Database,
    accent: "#f472b6",
    blurb: "Schemas, ER, SQL, transactions, indexing & scaling",
  },
};

const FALLBACK = { icon: Folder, accent: "#8497a8", blurb: "" };

// Turn a raw manifest node into a UI node, recursively. `trail` is the chain of
// ids from the root; it gives every category a stable URL and a parent URL.
const decorate = (raw, trail, inheritedAccent) => {
  const meta = META[raw.id];
  const accent = meta?.accent || inheritedAccent || FALLBACK.accent;
  const icon = meta?.icon || FALLBACK.icon;
  const blurb = meta?.blurb ?? "";

  const idTrail = [...trail, raw.id];
  const url = "/" + idTrail.map(encodeURIComponent).join("/");
  const parentUrl = trail.length ? "/" + trail.map(encodeURIComponent).join("/") : "/";

  return {
    id: raw.id,
    name: raw.name,
    folder: raw.folder,
    icon,
    accent,
    blurb,
    notes: raw.notes || [],
    idTrail,
    url,
    parentUrl,
    categories: (raw.categories || []).map((child) => decorate(child, idTrail, accent)),
  };
};

export const CATEGORIES = generated.map((c) => decorate(c, [], null));

// Notes anywhere in this category's subtree — used for card/shelf counts.
export const countNotes = (category) =>
  category.notes.length +
  category.categories.reduce((total, child) => total + countNotes(child), 0);

// Walk a chain of category ids ("llm" -> "rag") down the tree.
export const findCategoryByPath = (segments) => {
  let list = CATEGORIES;
  let node = null;
  for (const seg of segments) {
    node = list.find((c) => c.id === seg);
    if (!node) return null;
    list = node.categories;
  }
  return node;
};

// A note lives at <category chain>/<noteId>. The last segment is the note id,
// everything before it is the category chain.
export const findNoteByPath = (segments) => {
  if (segments.length === 0) return { category: null, note: null };
  const noteId = segments[segments.length - 1];
  const category = findCategoryByPath(segments.slice(0, -1));
  if (!category) return { category: null, note: null };
  return { category, note: category.notes.find((n) => n.id === noteId) || null };
};

// Legacy single-level helpers (kept for any existing callers).
export const findCategory = (id) => findCategoryByPath([id]);
export const findNote = (categoryId, noteId) => findNoteByPath([categoryId, noteId]).note;

/* note-type badge helpers (shared by list + reader) */
export const isPdf = (t) => t === "pdf";
export const badgeLabel = (t) => (t === "md" ? "MD" : "PDF");
export const badgeClass = (t) => (t === "md" ? "b-md" : "b-pdf");
