// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { CATEGORIES } from "../data/categories";

export default function Footer() {
  const year = new Date().getFullYear();
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="nb-foot">
      <div className="nb-foot-top">
        <nav className="nb-foot-links" aria-label="Shelves">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={c.url} style={{ "--ac": c.accent }}>
              {c.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="nb-foot-bar">
        <span className="nb-foot-right">
          <button className="nb-foot-topbtn" onClick={toTop} aria-label="Back to top">
            Top <ArrowUp size={13} />
          </button>
          <span>© {year} Harsh</span>
        </span>
      </div>
    </footer>
  );
}