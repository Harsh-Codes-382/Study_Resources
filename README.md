# Study Desk

A personal, static knowledge base for engineering notes. Pick a **shelf** (AWS, LLM, HLD, LLD…), browse the notes inside, and read Markdown and PDFs directly in the browser. Built to be hosted on Vercel with zero backend — just files in a folder.

---

## Features

- **Shelf → note → reader** navigation with real client-side routes.
- **Zero manual bookkeeping.** A build step scans your note folders and generates the manifest automatically — drop a file in, and it appears.
- **In-app Markdown rendering** (headings, lists, code blocks, tables, blockquotes, links, images) with correct handling of images stored alongside your notes.
- **PDF viewing** via an embedded viewer.
- **Per-category accent colors** so color tells you where you are.
- Fully static: deploys as plain HTML/JS/CSS, no server or database.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) for routing
- [lucide-react](https://lucide.dev/) for icons
- A small dependency-free Markdown renderer (`src/lib/markdown.js`)

---

## Project structure

```
study_notes/
├─ public/
│  ├─ AWS_Notes/                # one folder per shelf, named <NAME>_Notes
│  │  ├─ 01_AWS_Global_Infrastructure.md
│  │  ├─ 02_Cloud_Architecture.md
│  │  ├─ …
│  │  └─ AWS_NOtes_Images/      # images referenced by the .md files
│  ├─ HLD_Notes/
│  ├─ LLM_Notes/
│  ├─ favicon.svg               # + .ico / png / apple-touch-icon
│  └─ …
├─ scripts/
│  └─ generate-manifest.mjs     # scans public/*_Notes → src/notes-manifest.json
├─ src/
│  ├─ notes-manifest.json       # GENERATED — do not edit by hand
│  ├─ App.jsx                   # routes
│  ├─ App.css                   # theme + all styles
│  ├─ data/
│  │  └─ categories.js          # merges manifest with icon/accent/blurb
│  ├─ lib/
│  │  └─ markdown.js            # Markdown → HTML helper (image-aware)
│  └─ components/
│     ├─ Layout.jsx             # header + footer shell
│     ├─ Footer.jsx
│     ├─ Home.jsx               # shelf cards
│     ├─ CategoryPage.jsx       # note list for one shelf
│     └─ NotePage.jsx           # reader (md / pdf)
├─ vercel.json                  # SPA rewrite so deep links don't 404
└─ package.json
```

---

## How it works

**The manifest is the source of truth.** `scripts/generate-manifest.mjs` walks `public/`, finds every folder ending in `_Notes`, and lists the `.md` / `.pdf` files inside. For each file it derives:

- a **title** — filename with the leading number and underscores stripped (`07_Databases.md` → "Databases"),
- an **id** — a URL-safe slug used in the route (`07-databases`),
- a **type** (`md` or `pdf`) and a **path** under `/public`.

The result is written to `src/notes-manifest.json`. `src/data/categories.js` then attaches presentation (icon, accent color, blurb) per shelf and exports the final `CATEGORIES` array the app renders.

**Routes**

| Path                     | Shows                          |
| ------------------------ | ------------------------------ |
| `/`                      | All shelves (home cards)       |
| `/:categoryId`           | The note list for one shelf    |
| `/:categoryId/:noteId`   | The reader for a single note   |

Example: `/aws/07-databases`.

**Images.** Notes reference pictures relative to their own folder, e.g. `![diagram](AWS_NOtes_Images/vpc.png)`. Because the app renders on a route like `/aws/…`, the Markdown helper rewrites those relative paths against the note's folder so they resolve correctly (`/AWS_Notes/AWS_NOtes_Images/vpc.png`). Keep the path written inside the `.md` matching the real folder name.

---

## Getting started

**Prerequisites:** Node 18+.

```bash
# install dependencies
npm install
npm install react-router-dom lucide-react   # if not already present

# run the dev server (regenerates the manifest first)
npm run dev
```

Open the printed `localhost` URL.

Add these lines to the `"scripts"` block in `package.json` so the manifest is always fresh before dev and build:

```json
"manifest": "node scripts/generate-manifest.mjs",
"predev": "node scripts/generate-manifest.mjs",
"prebuild": "node scripts/generate-manifest.mjs"
```

Since `notes-manifest.json` is generated, ignore it in git:

```bash
echo "src/notes-manifest.json" >> .gitignore
```

---

## Adding a note

1. Drop a `.md` or `.pdf` into the relevant shelf folder, e.g. `public/AWS_Notes/25_New_Topic.md`.
2. Re-run the scanner: `npm run manifest` (or just restart `npm run dev`, which does it automatically).

That's the whole loop. Naming files with a zero-padded prefix (`01_`, `02_`, … `25_`) keeps them in order.

## Adding a new shelf

1. Create a folder named `<NAME>_Notes` under `public/`, e.g. `public/LLD_Notes/`.
2. (Optional) Add an entry in the `META` map in `src/data/categories.js`, keyed by the lowercase id, to give it an icon, accent color, and blurb:

   ```js
   lld: { icon: Blocks, accent: "#4ade80", blurb: "Object modelling & low-level design" },
   ```

   Without a `META` entry the shelf still works — it just uses a neutral default icon/color.

---

## Markdown support

The built-in renderer (`src/lib/markdown.js`) handles: headings, **bold** / *italic*, `inline code`, fenced code blocks, blockquotes, ordered and unordered lists, horizontal rules, links, images (folder-aware), and GitHub-style pipe tables.

It intentionally does **not** handle raw HTML embedded in Markdown or syntax highlighting. If you need those, the helper is isolated in one file and can be swapped for [`react-markdown`](https://github.com/remarkjs/react-markdown) + [`remark-gfm`](https://github.com/remarkjs/remark-gfm) without touching the rest of the app.

---

## Build & deploy

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

**Vercel:** push the repo to GitHub, then in Vercel choose *Add New → Project* and import it. Vite is auto-detected; no configuration needed. Every push redeploys.

`vercel.json` contains an SPA rewrite so that refreshing or deep-linking a route (e.g. `/aws/07-databases`) serves `index.html` instead of returning a 404:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## Customization

- **Accent colors / icons / blurbs:** `META` in `src/data/categories.js`.
- **Theme:** CSS variables at the top of `.nb-root` in `src/App.css`.
- **Favicon:** `public/favicon.svg` (the open-book mark); regenerate the PNG/ICO sizes from it if you change the design.
- **Footer:** `src/components/Footer.jsx` (tagline, GitHub link, name).

---

## License

Personal project. Use and adapt freely.