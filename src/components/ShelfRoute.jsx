// Resolves an arbitrary-depth URL to either a category (folder) view or a note
// reader. "/llm" and "/llm/rag" are categories; "/llm/rag/01-what-is-rag" is a
// note. We walk the tree: if the whole path is a category, show the folder;
// otherwise treat the last segment as a note id inside its parent category.
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findCategoryByPath, findNoteByPath } from "../data/categories";
import { isProtectedPath, isUnlocked } from "../lib/interviewGate";
import CategoryPage from "./CategoryPage";
import NotePage from "./NotePage";
import Layout from "./Layout";
import PasswordGate from "./PasswordGate";

export default function ShelfRoute() {
  const splat = useParams()["*"] || "";
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(isUnlocked());

  const segments = splat
    .split("/")
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));

  // Opening the protected shelf directly by URL is gated too — otherwise the
  // card lock would be trivial to skip by typing the address.
  if (isProtectedPath(segments) && !unlocked) {
    return (
      <Layout>
        <PasswordGate
          title="Interview Prep"
          accent="#f5a524"
          onClose={() => navigate("/")}
          onUnlock={() => setUnlocked(true)}
        />
      </Layout>
    );
  }

  const category = findCategoryByPath(segments);
  if (category) return <CategoryPage category={category} />;

  const { category: parent, note } = findNoteByPath(segments);
  return <NotePage category={parent} note={note} />;
}
