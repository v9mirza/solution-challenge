import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { RootErrorBoundary } from "./components/RootErrorBoundary.jsx";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<p>Missing #root</p>";
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RootErrorBoundary>
    </StrictMode>
  );
}
