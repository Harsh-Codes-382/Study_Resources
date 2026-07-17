import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, FileText, Folder, ChevronRight, ListChecks } from "lucide-react";
import Layout from "./Layout";
import { badgeLabel, badgeClass, countNotes } from "../data/categories";
import { hldProgress } from "../data/hldTracker";
import { lldProgress } from "../data/lldTracker";

// Category id -> its roadmap tracker. Add an entry to surface a tracker CTA.
const TRACKERS = {
  hld: { progress: hldProgress, url: "/hld/tracker", label: "HLD roadmap tracker", unit: "designs" },
  lld: { progress: lldProgress, url: "/lld/tracker", label: "LLD roadmap tracker", unit: "problems" },
};

export default function CategoryPage({ category }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const subcategories = useMemo(() => {
    if (!category) return [];
    if (!q) return category.categories;
    return category.categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [category, q]);

  const notes = useMemo(() => {
    if (!category) return [];
    if (!q) return category.notes;
    return category.notes.filter((n) => n.title.toLowerCase().includes(q));
  }, [category, q]);

  if (!category) {
    return (
      <Layout>
        <p className="nb-note-msg">
          No shelf here. <Link to="/">Back home</Link>.
        </p>
      </Layout>
    );
  }

  const Icon = category.icon;
  const tracker = TRACKERS[category.id];
  const p = tracker ? tracker.progress() : null;
  const isRoot = category.idTrail.length === 1;

  return (
    <Layout>
      <div className="nb-cat" style={{ "--ac": category.accent }}>
        <Link className="nb-back" to={category.parentUrl}>
          <ArrowLeft size={15} /> {isRoot ? "All shelves" : "Back"}
        </Link>

        <div className="nb-cat-head">
          <span className="nb-cat-icon">
            <Icon size={20} />
          </span>
          <div>
            <h2 className="nb-cat-name">{category.name}</h2>
            <p className="nb-cat-blurb">{category.blurb}</p>
          </div>
        </div>

        {tracker && (
          <Link className={`trk-cta ${category.id}`} to={tracker.url}>
            <span className="trk-cta-l">
              <span className="trk-cta-title">
                <ListChecks size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                {tracker.label}
              </span>
              <span className="trk-cta-sub">
                {p.done}/{p.total} {tracker.unit} complete — see what’s done, doing, and next
              </span>
            </span>
            <span className="trk-cta-go">Open tracker →</span>
          </Link>
        )}

        <div className="nb-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${category.name} notes…`}
          />
        </div>

        <ul className="nb-list">
          {notes.map((n, idx) => (
            <li key={`note-${n.id}`}>
              <Link className="nb-item" to={`${category.url}/${encodeURIComponent(n.id)}`}>
                <span className="nb-item-idx">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <FileText size={16} className="nb-item-file" />
                <span className="nb-item-title">{n.title}</span>
                <span className={`nb-badge ${badgeClass(n.type)}`}>
                  {badgeLabel(n.type)}
                </span>
              </Link>
            </li>
          ))}

          {subcategories.map((sub) => {
            const count = countNotes(sub);
            return (
              <li key={`cat-${sub.id}`}>
                <Link className="nb-item nb-item-folder" to={sub.url}>
                  <span className="nb-item-idx">
                    <Folder size={15} />
                  </span>
                  <span className="nb-item-title">{sub.name}</span>
                  <span className="nb-item-count">
                    {count} note{count !== 1 ? "s" : ""}
                  </span>
                  <ChevronRight size={16} className="nb-item-chev" />
                </Link>
              </li>
            );
          })}

          {subcategories.length === 0 && notes.length === 0 && (
            <li className="nb-empty">
              No notes match “{query}”. Try another term.
            </li>
          )}
        </ul>
      </div>
    </Layout>
  );
}
