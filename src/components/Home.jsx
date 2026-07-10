// src/components/Home.jsx
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "./Layout";
import { CATEGORIES } from "../data/categories";

export default function Home() {
  const total = CATEGORIES.reduce((a, c) => a + c.notes.length, 0);

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

      <div className="nb-grid">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.id}
              to={`/${c.id}`}
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
                {c.notes.length} note{c.notes.length !== 1 ? "s" : ""}
                <ChevronRight size={15} />
              </span>
            </Link>
          );
        })}
      </div>
    </Layout>
  );
}