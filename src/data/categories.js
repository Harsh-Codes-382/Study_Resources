// src/data/categories.js
//
// Merges the auto-generated file manifest with per-category presentation
// (icon, accent colour, blurb). To add a whole new category, just create a
// new folder like  public/DEVOPS_Notes/  and add a META entry keyed by its
// lowercase id ("devops"). Files inside are picked up automatically.

import { Cloud, Cpu, Network, Blocks, Folder } from "lucide-react";
import generated from "../notes-manifest.json";

const META = {
  aws: {
    icon: Cloud,
    accent: "#f0a63c",
    blurb: "Cloud infra, deploys & production reliability",
  },
  llm: {
    icon: Cpu,
    accent: "#a78bfa",
    blurb: "Tokenization, sampling & model internals",
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
};

const FALLBACK = { icon: Folder, accent: "#8497a8", blurb: "" };

export const CATEGORIES = generated.map((c) => {
  const meta = META[c.id] || FALLBACK;
  return {
    id: c.id,
    name: c.name,
    folder: c.folder,
    icon: meta.icon,
    accent: meta.accent,
    blurb: meta.blurb,
    notes: c.notes,
  };
});

export const findCategory = (id) => CATEGORIES.find((c) => c.id === id) || null;

export const findNote = (categoryId, noteId) => {
  const c = findCategory(categoryId);
  return c ? c.notes.find((n) => n.id === noteId) || null : null;
};

/* note-type badge helpers (shared by list + reader) */
export const isPdf = (t) => t === "pdf";
export const badgeLabel = (t) => (t === "md" ? "MD" : "PDF");
export const badgeClass = (t) => (t === "md" ? "b-md" : "b-pdf");
