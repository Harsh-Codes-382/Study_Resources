// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CategoryPage from "./components/CategoryPage";
import NotePage from "./components/NotePage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:categoryId" element={<CategoryPage />} />
        <Route path="/:categoryId/:noteId" element={<NotePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}