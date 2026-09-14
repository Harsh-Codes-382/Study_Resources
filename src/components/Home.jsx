// src/components/Home.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, Lock } from "lucide-react";
import Layout from "./Layout";
import PasswordGate from "./PasswordGate";
import { CATEGORIES, countNotes } from "../data/categories";
import { isProtectedShelf, isUnlocked } from "../lib/interviewGate";

// Every note title anywhere in a shelf's subtree, for search.
const allTitles = (c) =>
  c.notes.map((n) => n.title).concat(c.categories.flatMap(allTitles));

// The protected shelf lives in its own section, apart from the grid.
const INTERVIEW = CATEGORIES.find((c) => isProtectedShelf(c.id)) || null;
const REGULAR = CATEGORIES.filter((c) => !isProtectedShelf(c.id));

export default function Home() {
  const total = CATEGORIES.reduce((a, c) => a + countNotes(c), 0);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Gate state: which shelf url to open once the password is accepted.
  const [gateTarget, setGateTarget] = useState(null);
  // Re-render the interview panel as "unlocked" after a successful unlock.
  const [unlocked, setUnlocked] = useState(isUnlocked());

  const q = query.trim().toLowerCase();

  const shelves = useMemo(() => {
    if (!q) return REGULAR;
    return REGULAR.filter((c) =>
      [c.name, c.blurb, ...allTitles(c)].join(" ").toLowerCase().includes(q)
    );
  }, [q]);

  // Keep the interview panel in sync with the search too.
  const showInterview =
    INTERVIEW &&
    (!q || [INTERVIEW.name, INTERVIEW.blurb].join(" ").toLowerCase().includes(q));

  const openInterview = () => {
    if (isUnlocked()) navigate(INTERVIEW.url);
    else setGateTarget(INTERVIEW.url);
  };

  const nothingMatches = shelves.length === 0 && !showInterview;

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

      {nothingMatches ? (
        <p className="nb-empty">No shelves match “{query.trim()}”.</p>
      ) : (
        <>
          {shelves.length > 0 && (
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

          {showInterview && (
            <section
              className="nb-ip-section"
              style={{ "--ac": INTERVIEW.accent }}
            >
              <div className="nb-ip-divider">
                <span>Private</span>
              </div>

              <button
                type="button"
                className="nb-ip-card"
                onClick={openInterview}
              >
                <span className="nb-ip-icon">
                  <Lock size={24} />
                </span>

                <span className="nb-ip-body">
                  <span className="nb-ip-titlerow">
                    <span className="nb-ip-name">{INTERVIEW.name}</span>
                    <span className="nb-ip-tag">
                      <Lock size={11} />
                      {unlocked ? "Unlocked" : "Password protected"}
                    </span>
                  </span>
                  <span className="nb-ip-blurb">
                    {unlocked
                      ? `${countNotes(INTERVIEW)} note${
                          countNotes(INTERVIEW) !== 1 ? "s" : ""
                        } · Core Java, Spring Boot & more`
                      : "Core Java, Spring Boot & more — enter the password to open."}
                  </span>
                </span>

                <span className="nb-ip-action">
                  {unlocked ? (
                    <>
                      Open <ChevronRight size={16} />
                    </>
                  ) : (
                    <>
                      Unlock <Lock size={14} />
                    </>
                  )}
                </span>
              </button>
            </section>
          )}
        </>
      )}

      {gateTarget && (
        <PasswordGate
          title="Interview Prep"
          accent={INTERVIEW?.accent || "#f5a524"}
          onClose={() => setGateTarget(null)}
          onUnlock={() => {
            setUnlocked(true);
            const target = gateTarget;
            setGateTarget(null);
            navigate(target);
          }}
        />
      )}
    </Layout>
  );
}
