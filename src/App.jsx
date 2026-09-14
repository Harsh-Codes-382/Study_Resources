import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import "./App.css";

// Home is the landing page, so it stays in the initial bundle. Everything else
// (the note reader, category views, trackers) is split into its own chunk and
// loaded only when you navigate there — the heavy markdown/diagram machinery
// lives behind ShelfRoute, so the homepage never pays for it.
const ShelfRoute = lazy(() => import("./components/ShelfRoute"));
const HldTracker = lazy(() => import("./components/HldTracker"));
const LldTracker = lazy(() => import("./components/LldTracker"));

// Shown for the brief moment a route chunk is being fetched.
const RouteFallback = () => (
  <div className="nb-root">
    <div className="nb-wrap">
      <p className="nb-note-msg">Loading…</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hld/tracker" element={<HldTracker />} />
          <Route path="/lld/tracker" element={<LldTracker />} />
          {/* Any depth: /llm, /llm/rag, /llm/rag/01-what-is-rag */}
          <Route path="/*" element={<ShelfRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
