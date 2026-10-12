// Lists the Excel / Google Sheets links for the Interview Prep shelf. Each row
// opens the sheet in a new tab. The links themselves live in one editable file:
// src/data/interviewSheets.js (add more there — no changes needed here).
//
// This view renders only via ShelfRoute at /interview-prep/sheets, which is
// behind the Interview Prep password gate.
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Sheet, ExternalLink } from "lucide-react";
import Layout from "./Layout";
import { SHEETS } from "../data/interviewSheets";

// Matches the Interview Prep shelf accent (see META in src/data/categories.js).
const ACCENT = "#f5a524";

export default function ExcelLinks({ backUrl = "/interview-prep", backLabel = "Interview Prep" }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const sheets = useMemo(() => {
    if (!q) return SHEETS;
    return SHEETS.filter((s) =>
      [s.title, s.note].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <Layout>
      <div className="nb-cat" style={{ "--ac": ACCENT }}>
        <Link className="nb-back" to={backUrl}>
          <ArrowLeft size={15} /> {backLabel}
        </Link>

        <div className="nb-cat-head">
          <span className="nb-cat-icon">
            <Sheet size={20} />
          </span>
          <div>
            <h2 className="nb-cat-name">Excel Sheets</h2>
            <p className="nb-cat-blurb">
              Quick links to my spreadsheets — opens in a new tab.
            </p>
          </div>
        </div>

        {SHEETS.length > 0 && (
          <div className="nb-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sheets…"
            />
          </div>
        )}

        <ul className="nb-list">
          {sheets.map((s, idx) => (
            <li key={`${s.url}-${idx}`}>
              <a
                className="nb-item"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="nb-item-idx">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <Sheet size={16} className="nb-item-file" />
                <span className="nb-item-title">{s.title}</span>
                {s.note && <span className="nb-item-count">{s.note}</span>}
                <span className="nb-badge b-sheet">SHEET</span>
                <ExternalLink size={14} className="nb-item-chev" />
              </a>
            </li>
          ))}

          {SHEETS.length === 0 && (
            <li className="nb-empty">
              No sheets yet. Add one in src/data/interviewSheets.js.
            </li>
          )}

          {SHEETS.length > 0 && sheets.length === 0 && (
            <li className="nb-empty">
              No sheets match “{query}”. Try another term.
            </li>
          )}
        </ul>
      </div>
    </Layout>
  );
}
