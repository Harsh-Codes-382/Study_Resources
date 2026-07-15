// src/lib/markdown.js
//
// Tiny, dependency-free Markdown -> HTML renderer.
// Supports: headings, bold/italic, inline code, fenced code blocks,
// blockquotes, ordered/unordered lists, horizontal rules, links, images,
// and GitHub-style pipe tables.
//
// `basePath` matters for images: your notes reference pictures like
//   ![diagram](AWS_NOtes_Images/vpc.png)
// and that path is relative to the .md file's folder. Since the app renders
// on a route like /aws/..., a raw relative src would resolve against the URL,
// not the file. So we rewrite relative image srcs to sit under basePath,
// e.g. "/AWS_Notes/AWS_NOtes_Images/vpc.png".

export function mdToHtml(md, basePath = "/") {
  const base = basePath.endsWith("/") ? basePath : basePath + "/";

  // Escape HTML-special chars, but leave existing entity references
  // (e.g. &nbsp;, &amp;, &#39;) intact so authored entities survive instead of
  // becoming literal "&nbsp;" text.
  const esc = (s) =>
    s
      .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // absolute URLs / data URIs / root-absolute paths are left alone;
  // everything else is resolved against the note's folder.
  const resolveSrc = (src) => {
    const s = src.trim();
    if (/^(https?:|data:|\/)/i.test(s)) return s;
    return base + s.replace(/^\.?\//, "");
  };

  const inline = (s) =>
    esc(s)
      // restore a small allowlist of safe inline HTML tags that esc() escaped,
      // so authored <sup>/<sub> render instead of showing as literal text.
      .replace(/&lt;(\/?)(sup|sub)&gt;/g, "<$1$2>")
      // images first (they start with '!', links don't)
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        (_m, alt, src) =>
          `<img alt="${alt}" src="${resolveSrc(src)}" loading="lazy" />`
      )
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      );

  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let i = 0;
  let listType = null; // "ul" | "ol" | null

  const closeList = () => {
    if (listType) {
      html += `</${listType}>`;
      listType = null;
    }
  };

  const parseRow = (l) =>
    l
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    const fence = line.match(/^```\s*([\w-]*)/);
    if (fence) {
      closeList();
      const lang = fence[1].toLowerCase();
      i++;
      let code = "";
      while (i < lines.length && !/^```/.test(lines[i])) {
        code += lines[i] + "\n";
        i++;
      }
      i++; // closing fence
      const body = esc(code.replace(/\n$/, ""));
      // Mermaid blocks become a container the client renders after mount
      // (see the mermaid.run() pass in NotePage). The escaped source round-trips
      // back to plain text via the DOM, which is what mermaid reads.
      html +=
        lang === "mermaid"
          ? `<div class="mermaid">${body}</div>`
          : `<pre><code>${body}</code></pre>`;
      continue;
    }

    // horizontal rule
    if (/^---\s*$/.test(line)) {
      closeList();
      html += "<hr/>";
      i++;
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      const lvl = Math.min(h[1].length, 4);
      html += `<h${lvl}>${inline(h[2])}</h${lvl}>`;
      i++;
      continue;
    }

    // pipe table: a "| ... |" line followed by a "| --- | --- |" separator
    if (
      /^\s*\|.*\|\s*$/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) &&
      lines[i + 1].includes("-")
    ) {
      closeList();
      const header = parseRow(line);
      i += 2; // skip header + separator
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      html +=
        "<table><thead><tr>" +
        header.map((c) => `<th>${inline(c)}</th>`).join("") +
        "</tr></thead><tbody>" +
        rows
          .map(
            (r) =>
              "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>"
          )
          .join("") +
        "</tbody></table>";
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      closeList();
      let quote = "";
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote += lines[i].replace(/^>\s?/, "") + " ";
        i++;
      }
      html += `<blockquote>${inline(quote.trim())}</blockquote>`;
      continue;
    }

    // ordered list
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (listType !== "ol") {
        closeList();
        html += "<ol>";
        listType = "ol";
      }
      html += `<li>${inline(ol[1])}</li>`;
      i++;
      continue;
    }

    // unordered list
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (listType !== "ul") {
        closeList();
        html += "<ul>";
        listType = "ul";
      }
      html += `<li>${inline(ul[1])}</li>`;
      i++;
      continue;
    }

    // blank line
    if (/^\s*$/.test(line)) {
      closeList();
      i++;
      continue;
    }

    // paragraph — gather consecutive plain lines
    closeList();
    let para = line;
    i++;
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^\s*(#{1,6}\s|[-*]\s|\d+\.\s|>|\||```|---)/.test(lines[i])
    ) {
      para += " " + lines[i];
      i++;
    }
    html += `<p>${inline(para)}</p>`;
  }

  closeList();
  return html;
}