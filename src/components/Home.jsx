// src/components/Home.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import Layout from "./Layout";
import { CATEGORIES, countNotes } from "../data/categories";

// Every note title anywhere in a shelf's subtree, for search.
const allTitles = (c) =>
  c.notes.map((n) => n.title).concat(c.categories.flatMap(allTitles));

export default function Home() {
  const total = CATEGORIES.reduce((a, c) => a + countNotes(c), 0);
  const [query, setQuery] = useState("");

  const shelves = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((c) =>
      [c.name, c.blurb, ...allTitles(c)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  return (
    <Layout
      headRight={
        <p className="nb-tag">
          {CATEGORIES.length} shelves · {total} notes
        </p>
      }
    >
      <div className="nb-hero">
        <p className="nb-eyebrow">Personal knowledge base</p>
        <h1 className="nb-title">Pick a shelf.</h1>
        <p className="nb-sub">
          Every note you keep, sorted by discipline. Open a shelf to read its
          Markdown and PDFs.
        </p>
      </div>

      <div className="nb-search">
        <Search size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shelves…"
          aria-label="Search shelves"
        />
      </div>

      {shelves.length === 0 ? (
        <p className="nb-empty">No shelves match “{query.trim()}”.</p>
      ) : (
        <div className="nb-grid">
          {shelves.map((c) => {
            const Icon = c.icon;
            const count = countNotes(c);
            return (
              <Link
                key={c.id}
                to={c.url}
                className="nb-card"
                style={{ "--ac": c.accent }}
              >
                <span className="nb-card-bar" />
                <span className="nb-card-icon">
                  <Icon size={22} />
                </span>
                <span className="nb-card-name">{c.name}</span>
                <span className="nb-card-blurb">{c.blurb}</span>
                <span className="nb-card-foot">
                  {count} note{count !== 1 ? "s" : ""}
                  <ChevronRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Layout>
  );
}