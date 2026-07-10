// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { GitBranch, ArrowUp } from "lucide-react";
import { CATEGORIES } from "../data/categories";

export default function Footer() {
  const total = CATEGORIES.reduce((a, c) => a + c.notes.length, 0);
  const year = new Date().getFullYear();
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="nb-foot">
      <div className="nb-foot-top">
        <div className="nb-foot-brand">
          <span className="nb-foot-name">Study Desk</span>
          <span className="nb-foot-tag">
            A personal engineering knowledge base — {total} notes across{" "}
            {CATEGORIES.length} shelves, all served as static files.
          </span>
        </div>

        <nav className="nb-foot-links" aria-label="Shelves">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/${c.id}`} style={{ "--ac": c.accent }}>
              {c.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="nb-foot-bar">
        <span>Built with React + Vite · hosted on Vercel</span>

        <span className="nb-foot-right">
          <a
            href="https://github.com/Harsh-Codes-382/Study_Resources"
            target="_blank"
            rel="noopener"
            aria-label="Source on GitHub"
          >
            <GitBranch size={14} /> Source
          </a>
          <button className="nb-foot-topbtn" onClick={toTop} aria-label="Back to top">
            Top <ArrowUp size={13} />
          </button>
          <span>© {year} Harsh</span>
        </span>
      </div>
    </footer>
  );
}