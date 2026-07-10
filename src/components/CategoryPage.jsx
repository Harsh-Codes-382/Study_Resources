import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, FileText, ListChecks } from "lucide-react";
import Layout from "./Layout";
import { findCategory, badgeLabel, badgeClass } from "../data/categories";
import { hldProgress } from "../data/hldTracker";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const category = findCategory(categoryId);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!category) return [];
    const q = query.trim().toLowerCase();
    if (!q) return category.notes;
    return category.notes.filter((n) => n.title.toLowerCase().includes(q));
  }, [category, query]);

  if (!category) {
    return (
      <Layout>
        <p className="nb-note-msg">
          No shelf called “{categoryId}”. <Link to="/">Back home</Link>.
        </p>
      </Layout>
    );
  }

  const Icon = category.icon;
  const showTracker = category.id === "hld";
  const p = showTracker ? hldProgress() : null;

  return (
    <Layout>
      <div className="nb-cat" style={{ "--ac": category.accent }}>
        <Link className="nb-back" to="/">
          <ArrowLeft size={15} /> All shelves
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

        {showTracker && (
          <Link className="trk-cta" to="/hld/tracker">
            <span className="trk-cta-l">
              <span className="trk-cta-title">
                <ListChecks size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                HLD roadmap tracker
              </span>
              <span className="trk-cta-sub">
                {p.done}/{p.total} designs complete — see what’s done, doing, and next
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
          {filtered.map((n, idx) => (
            <li key={n.id}>
              <Link className="nb-item" to={`/${category.id}/${n.id}`}>
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
          {filtered.length === 0 && (
            <li className="nb-empty">
              No notes match “{query}”. Try another term.
            </li>
          )}
        </ul>
      </div>
    </Layout>
  );
}