import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Use hydration for SSR in production, createRoot for development
if (import.meta.env.PROD && root.innerHTML.trim()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
