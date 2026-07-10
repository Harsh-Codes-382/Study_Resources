// src/components/Layout.jsx
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import Footer from "./Footer";

export default function Layout({ children, headRight }) {
  return (
    <div className="nb-root">
      <div className="nb-wrap">
        <header className="nb-head">
          <Link to="/" className="nb-brand" aria-label="Go to home">
            <BookOpen size={18} />
            <span>Study&nbsp;Desk</span>
          </Link>
          {headRight}
        </header>

        {children}

        <Footer/>
      </div>
    </div>
  );
}