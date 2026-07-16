// src/components/NotePage.jsx
import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Layout from "./Layout";
import { badgeLabel, badgeClass, isPdf } from "../data/categories";
import { mdToHtml } from "../lib/markdown";
import DiagramLightbox from "./DiagramLightbox";

// The note body is rendered via dangerouslySetInnerHTML and then mutated in
// place by mermaid.run() (raw source → SVG). React 19 re-applies innerHTML on
// every re-render of the owning component, which would wipe those SVGs whenever
// unrelated state (e.g. the zoom modal) changes. Isolating the article in a
// memo'd component keeps React from touching its DOM unless `html` itself
// changes, so the rendered diagrams survive.
const MarkdownArticle = memo(function MarkdownArticle({ html, innerRef }) {
  return (
    <article
      ref={innerRef}
      className="nb-md"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

export default function NotePage({ category, note }) {
  const [html, setHtml] = useState("");
  // Track which note the loaded html / any error belongs to, so loading and
  // error are *derived* during render instead of set synchronously in the
  // effect (which React 19 flags as a cascading-render smell).
  const [renderedPath, setRenderedPath] = useState(null);
  const [errorPath, setErrorPath] = useState(null);
  const [zoomSvg, setZoomSvg] = useState(null); // markup of the diagram being viewed
  const mdRef = useRef(null);

  useEffect(() => {
    if (!note || isPdf(note.type)) return;

    // folder the .md lives in, e.g. "/AWS_Notes/" — used to resolve images
    const basePath = note.path.slice(0, note.path.lastIndexOf("/") + 1);

    let alive = true;
    fetch(note.path)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((text) => {
        if (!alive) return;
        setHtml(mdToHtml(text, basePath));
        setRenderedPath(note.path);
      })
      .catch(() => alive && setErrorPath(note.path));

    return () => {
      alive = false;
    };
  }, [note]);

  // Derived view state for the current note (no effect-time setState needed).
  const pdf = note ? isPdf(note.type) : false;
  const errored = !!note && errorPath === note.path;
  const loading = !!note && !pdf && !errored && renderedPath !== note.path;

  // Render any Mermaid diagrams once the note HTML is in the DOM. Loaded lazily
  // so the ~viewer-only mermaid bundle isn't in the initial payload.
  useEffect(() => {
    if (!html || !html.includes('class="mermaid"')) return;
    let alive = true;
    import("mermaid").then(({ default: mermaid }) => {
      if (!alive) return;
      mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
      mermaid.run({ querySelector: ".nb-md .mermaid" }).then(() => {
        if (!alive || !mdRef.current) return;
        // Make each rendered diagram open the zoom/pan lightbox on click.
        mdRef.current.querySelectorAll(".mermaid").forEach((el) => {
          const svg = el.querySelector("svg");
          if (!svg) return;
          el.classList.add("nb-zoomable");
          el.onclick = () => {
            // Re-namespace the svg id so the clone in the modal doesn't collide
            // with the inline diagram's id (mermaid scopes its <style> by that id).
            let markup = svg.outerHTML;
            if (svg.id) markup = markup.split(svg.id).join(`${svg.id}-zoom`);
            setZoomSvg(markup);
          };
        });
      });
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
          <Link className="nb-back" to={category.url}>
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

        {pdf ? (
          <div className="nb-pdf">
            <iframe title={note.title} src={note.path} />
          </div>
        ) : loading ? (
          <p className="nb-note-msg">Loading…</p>
        ) : errored ? (
          <p className="nb-note-msg">
            Couldn’t load this note. Please try again later.
          </p>
        ) : (
          <MarkdownArticle html={html} innerRef={mdRef} />
        )}
      </div>

      {zoomSvg && (
        <DiagramLightbox svg={zoomSvg} onClose={() => setZoomSvg(null)} />
      )}
    </Layout>
  );
}