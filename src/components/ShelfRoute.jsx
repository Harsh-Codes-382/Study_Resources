// Resolves an arbitrary-depth URL to either a category (folder) view or a note
// reader. "/llm" and "/llm/rag" are categories; "/llm/rag/01-what-is-rag" is a
// note. We walk the tree: if the whole path is a category, show the folder;
// otherwise treat the last segment as a note id inside its parent category.
import { useParams } from "react-router-dom";
import { findCategoryByPath, findNoteByPath } from "../data/categories";
import CategoryPage from "./CategoryPage";
import NotePage from "./NotePage";

export default function ShelfRoute() {
  const splat = useParams()["*"] || "";
  const segments = splat
    .split("/")
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));

  const category = findCategoryByPath(segments);
  if (category) return <CategoryPage category={category} />;

  const { category: parent, note } = findNoteByPath(segments);
  return <NotePage category={parent} note={note} />;
}
