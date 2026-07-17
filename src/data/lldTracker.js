// src/data/lldTracker.js
//
// LLD roadmap tracker — STATUS LIVES HERE, in code.
// When you finish a problem, change its `status` to "done" (or "doing"),
// commit, and the live site reflects it. This is the single source of truth.
//
// Each topic is an object:
//   { name, status?, note? }
//     • name   — display name (required)
//     • status — "todo" (default) | "doing" | "done"
//     • note   — OPTIONAL id of an in-app LLD note to link the row to.
//                If set, the row shows an "Open note" link to /lld/<note>.
//                The id is the slug used in the URL, e.g. "01-parking-lot".
//
// A plain string is shorthand for { name, status: "todo" }.

export const LLD_TIERS = [
  {
    key: "easy",
    label: "Easy",
    blurb: "Bounded scope · pure object modelling — Strategy, Factory, State, one at a time",
    topics: [
      { name: "Parking Lot" },
      { name: "Vending Machine" },
      { name: "ATM" },
      { name: "Coffee / Juice Vending Machine" },
      { name: "Logging Framework (multi-level, multi-sink)" },
      { name: "Tic-Tac-Toe (N×N)" },
      { name: "Snake & Ladder" },
      { name: "Stack (thread-safe) & Bounded Blocking Queue" },
    ],
  },
  {
    key: "medium",
    label: "Medium",
    blurb: "Composition of 2–3 patterns · concurrency & extensibility start to matter",
    topics: [
      { name: "Elevator System (N lifts, M floors)" },
      { name: "LRU / LFU Cache" },
      { name: "In-Memory Key-Value Store (TTL + eviction)" },
      { name: "Rate Limiter (token bucket / sliding window)" },
      { name: "Notification System (email / SMS / push)" },
      { name: "Text Editor (undo / redo)" },
      { name: "Chess" },
      { name: "Splitwise" },
      { name: "Meeting Scheduler / Calendar" },
      { name: "In-Memory Pub/Sub (message queue)" },
      { name: "Library Management System" },
      { name: "Car Rental System" },
    ],
  },
  {
    key: "hard",
    label: "Hard",
    blurb: "Rich domain · concurrency-heavy — seat locking, state machines, worker pools",
    topics: [
      { name: "Ticket Booking (BookMyShow) — seat locking" },
      { name: "Ride-Hailing (Uber) matching" },
      { name: "Food Delivery (Swiggy / DoorDash)" },
      { name: "Distributed Job Scheduler (single-node)" },
      { name: "Inventory / Order Management (Amazon)" },
      { name: "Payment Gateway" },
      { name: "Card Game Engine (Poker / UNO)" },
      { name: "Stack Overflow (Q/A, votes, reputation)" },
      { name: "Airline / Flight Booking" },
    ],
  },
];

// Progress computed from the code-defined statuses (used by the LLD card).
export function lldProgress() {
  let done = 0,
    total = 0;
  LLD_TIERS.forEach((tier) =>
    tier.topics.forEach((raw) => {
      total++;
      const t = typeof raw === "string" ? {} : raw;
      if (t.status === "done") done++;
    })
  );
  return { done, total };
}
