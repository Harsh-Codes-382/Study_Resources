// src/data/hldTracker.js
//
// HLD roadmap tracker — STATUS LIVES HERE, in code.
// When you finish a design, change its `status` to "done" (or "doing"),
// commit, and the live site reflects it. This is the single source of truth.
//
// Each topic is an object:
//   { name, status?, note? }
//     • name   — display name (required)
//     • status — "todo" (default) | "doing" | "done"
//     • note   — OPTIONAL id of an in-app HLD note to link the row to.
//                If set, the row shows an "Open note" link to /hld/<note>.
//                The id is the slug used in the URL, e.g. "03-distributed-cache"
//                (see the note's route in the HLD shelf).
//
// A plain string is shorthand for { name, status: "todo" }.

export const HLD_TIERS = [
  {
    key: "easy",
    label: "Easy",
    blurb: "Bounded scope · object modelling & entry-level distributed systems",
    topics: [
      { name: "URL Shortener (TinyURL)", status: "done" },
      { name: "Online Bookstore (Amazon)" },
      { name: "Text Storage (Pastebin)" },
      { name: "Authentication System" },
      { name: "Content Delivery Network (CDN)" },
      { name: "Distributed Cache", status: "done" },
      { name: "Distributed Job Scheduler", status: "done" },
      { name: "Distributed Key-Value Store" },
    ],
  },
  {
    key: "medium",
    label: "Medium",
    blurb: "Real products · read/write scale, feeds, storage & consistency tradeoffs",
    topics: [
      { name: "Rate Limiter" },
      { name: "Notification Service" },
      { name: "Autocomplete for Search" },
      { name: "Online Code Editor" },
      { name: "Twitter" },
      { name: "Reddit" },
      { name: "Instagram" },
      { name: "Tinder" },
      { name: "Facebook" },
      { name: "WhatsApp" },
      { name: "TikTok" },
      { name: "YouTube" },
      { name: "Netflix" },
      { name: "Spotify" },
      { name: "Shopify" },
      { name: "E-commerce (Amazon)" },
      { name: "Google Search" },
      { name: "Payment System" },
      { name: "Flight Booking System" },
      { name: "Distributed Message Queue (Kafka)" },
      { name: "Analytics Platform (Logging, Metrics)" },
      { name: "Stock Exchange System" },
    ],
  },
  {
    key: "hard",
    label: "Hard",
    blurb: "Deep systems · coordination, geo-scale, real-time & strong guarantees",
    topics: [
      { name: "Distributed Locking Service" },
      { name: "Distributed Web Crawler" },
      { name: "File Sharing (Dropbox)" },
      { name: "Object Storage (S3)" },
      { name: "Ticket Booking (BookMyShow)" },
      { name: "Location-Based Service (Yelp)" },
      { name: "Code Deployment System" },
      { name: "Food Delivery (DoorDash)" },
      { name: "Google Docs" },
      { name: "Uber" },
      { name: "Zoom" },
      { name: "Google Maps" },
    ],
  },
];

// Progress computed from the code-defined statuses (used by the HLD card).
export function hldProgress() {
  let done = 0,
    total = 0;
  HLD_TIERS.forEach((tier) =>
    tier.topics.forEach((raw) => {
      total++;
      const t = typeof raw === "string" ? {} : raw;
      if (t.status === "done") done++;
    })
  );
  return { done, total };
}