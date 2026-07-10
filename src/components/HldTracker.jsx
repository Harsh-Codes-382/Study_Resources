// src/components/HldTracker.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Layout from "./Layout";
import { HLD_TIERS } from "../data/hldTracker";
import "./HldTracker.css";

const STATES = ["todo", "doing", "done"];
const STATUS_TXT = { todo: "To do", doing: "Doing", done: "Done" };
const keyOf = (tierKey, name) => `${tierKey}::${name}`;
const norm = (t) => (typeof t === "string" ? { name: t } : t);

export default function HldTracker() {
  // Initial statuses come from the data file. Editing hldTracker.js is what
  // persists; the node click below only changes things for this session.
  const initial = useMemo(() => {
    const m = {};
    HLD_TIERS.forEach((tier) =>
      tier.topics.forEach((raw) => {
        const t = norm(raw);
        m[keyOf(tier.key, t.name)] = STATES.includes(t.status)
          ? t.status
          : "todo";
      })
    );
    return m;
  }, []);

  const [statuses, setStatuses] = useState(initial);
  const [filter, setFilter] = useState("all");

  const cycle = (k) =>
    setStatuses((s) => ({
      ...s,
      [k]: STATES[(STATES.indexOf(s[k]) + 1) % 3],
    }));

  const all = HLD_TIERS.reduce((a, t) => a + t.topics.length, 0);
  let done = 0,
    doing = 0;
  Object.values(statuses).forEach((v) => {
    if (v === "done") done++;
    else if (v === "doing") doing++;
  });
  const pct = all ? Math.round((done / all) * 100) : 0;
  const circ = 2 * Math.PI * 26;
  const offset = circ * (1 - (all ? done / all : 0));

  return (
    <Layout headRight={<p className="nb-tag">{done}/{all} designs</p>}>
      <div className="trk">
        <Link className="nb-back" to="/hld">
          <ArrowLeft size={15} /> HLD notes
        </Link>

        <div className="trk-head">
          <p className="trk-eyebrow">System Design · HLD Roadmap</p>
          <h1 className="trk-title">HLD Study Tracker</h1>
          <p className="trk-sub">
            {all} designs across three tiers. Status is defined in code — edit{" "}
            <code>src/data/hldTracker.js</code> to change it permanently. Tap a
            node to cycle it for this session.
          </p>

          <div className="trk-overall">
            <div className="trk-ring-wrap">
              <svg className="trk-ring" viewBox="0 0 62 62">
                <circle className="trk-ring-track" cx="31" cy="31" r="26" />
                <circle
                  className="trk-ring-fill"
                  cx="31"
                  cy="31"
                  r="26"
                  strokeDasharray={circ.toFixed(1)}
                  strokeDashoffset={offset.toFixed(1)}
                />
                <text className="trk-ring-num" x="31" y="36" textAnchor="middle">
                  {pct}%
                </text>
              </svg>
              <div>
                <div className="trk-big">
                  {done} of {all} complete
                </div>
                <div className="trk-small">
                  {doing} in progress · {all - done - doing} not started
                </div>
              </div>
            </div>

            <div className="trk-legend">
              <span>
                <i className="trk-dot todo" />
                To do
              </span>
              <span>
                <i className="trk-dot doing" />
                Doing
              </span>
              <span>
                <i className="trk-dot done" />
                Done
              </span>
            </div>
          </div>

          <div className="trk-filters">
            {["all", "todo", "doing", "done"].map((f) => (
              <button
                key={f}
                className={`trk-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : STATUS_TXT[f]}
              </button>
            ))}
          </div>
        </div>

        {HLD_TIERS.map((tier) => {
          const topics = tier.topics.map(norm);
          const tDone = topics.filter(
            (t) => statuses[keyOf(tier.key, t.name)] === "done"
          ).length;
          const w = Math.round((tDone / topics.length) * 100);

          const visible =
            filter === "all"
              ? topics
              : topics.filter((t) => statuses[keyOf(tier.key, t.name)] === filter);
          if (!visible.length) return null;

          return (
            <section className={`trk-tier ${tier.key}`} key={tier.key}>
              <div className="trk-tier-head">
                <span className="trk-tier-label">{tier.label}</span>
                <span className="trk-sub" style={{ fontSize: "12.5px" }}>
                  {tier.blurb}
                </span>
                <span className="trk-tier-count">
                  {tDone}/{topics.length}
                </span>
              </div>
              <div className="trk-tier-bar">
                <i style={{ width: `${w}%` }} />
              </div>

              {topics.map((t, i) => {
                const k = keyOf(tier.key, t.name);
                const st = statuses[k];
                if (filter !== "all" && st !== filter) return null;
                return (
                  <div className={`trk-row ${st}`} key={k}>
                    <button
                      className="trk-node"
                      onClick={() => cycle(k)}
                      title={`${STATUS_TXT[st]} — click to change`}
                      aria-label={`Status: ${STATUS_TXT[st]}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          className="trk-glyph done"
                          d="M5 12.5l4.5 4.5L19 7"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          className="trk-glyph doing"
                          cx="12"
                          cy="12"
                          r="4.5"
                          strokeWidth="2.2"
                        />
                      </svg>
                    </button>
                    <span className="trk-num">
                      {tier.label[0]}
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="trk-name">{t.name}</span>
                    <span className="trk-tag">{STATUS_TXT[st]}</span>
                    {t.note && (
                      <Link className="trk-note-link" to={`/hld/${t.note}`}>
                        Open note <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </Layout>
  );
}