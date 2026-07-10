// src/components/NotePage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Layout from "./Layout";
import {
  findCategory,
  findNote,
  badgeLabel,
  badgeClass,
  isPdf,
} from "../data/categories";
import { mdToHtml } from "../lib/markdown";

export default function NotePage() {
  const { categoryId, noteId } = useParams();
  const category = findCategory(categoryId);
  const note = findNote(categoryId, noteId);

  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!note || isPdf(note.type)) return;

    // folder the .md lives in, e.g. "/AWS_Notes/" — used to resolve images
    const basePath = note.path.slice(0, note.path.lastIndexOf("/") + 1);

    let alive = true;
    setStatus("loading");
    fetch(note.path)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((text) => {
        if (!alive) return;
        setHtml(mdToHtml(text, basePath));
        setStatus("idle");
      })
      .catch(() => alive && setStatus("error"));

    return () => {
      alive = false;
    };
  }, [note]);

  // Render any Mermaid diagrams once the note HTML is in the DOM. Loaded lazily
  // so the ~viewer-only mermaid bundle isn't in the initial payload.
  useEffect(() => {
    if (!html || !html.includes('class="mermaid"')) return;
    let alive = true;
    import("mermaid").then(({ default: mermaid }) => {
      if (!alive) return;
      mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
      mermaid.run({ querySelector: ".nb-md .mermaid" });
    });
    return () => {
      alive = false;
    };
  }, [html]);

  if (!category || !note) {
    return (
      <Layout>
        <p className="nb-note-msg">
          Note not found. <Link to="/">Back home</Link>.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="nb-reader" style={{ "--ac": category.accent }}>
        <div className="nb-reader-bar">
          <Link className="nb-back" to={`/${category.id}`}>
            <ArrowLeft size={15} /> {category.name}
          </Link>
          <span className={`nb-badge ${badgeClass(note.type)}`}>
            {badgeLabel(note.type)}
          </span>
          <a
            className="nb-open-raw"
            href={note.path}
            target="_blank"
            rel="noopener"
          >
            Open file <ExternalLink size={13} />
          </a>
        </div>

        <h2 className="nb-reader-title">{note.title}</h2>

        {isPdf(note.type) ? (
          <div className="nb-pdf">
            <iframe title={note.title} src={note.path} />
          </div>
        ) : status === "loading" ? (
          <p className="nb-note-msg">Loading…</p>
        ) : status === "error" ? (
          <p className="nb-note-msg">
            Couldn’t load this note. Check that the file exists at{" "}
            <code>public{note.path}</code>.
          </p>
        ) : (
          <article
            className="nb-md"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </Layout>
  );
}