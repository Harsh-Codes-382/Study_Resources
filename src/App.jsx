import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import ShelfRoute from "./components/ShelfRoute";
import HldTracker from "./components/HldTracker";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hld/tracker" element={<HldTracker />} />
        {/* Any depth: /llm, /llm/rag, /llm/rag/01-what-is-rag */}
        <Route path="/*" element={<ShelfRoute />} />
      </Routes>
    </BrowserRouter>
  );
}