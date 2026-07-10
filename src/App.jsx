import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CategoryPage from "./components/CategoryPage";
import NotePage from "./components/NotePage";
import HldTracker from "./components/HldTracker";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/hld/tracker" element={<HldTracker />} />
        <Route path="/:categoryId" element={<CategoryPage />} />
        <Route path="/:categoryId/:noteId" element={<NotePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}