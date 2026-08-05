import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import { StationProgressProvider } from "./context/StationProgress";
import "./styles.css";

// HashRouter so the app works on static hosts (GitHub Pages) that have no
// SPA fallback: every route lives after the #, so refreshes and direct links
// always load index.html. Routes, params, and search params behave identically
// to BrowserRouter from the app's perspective.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <StationProgressProvider>
        <App />
      </StationProgressProvider>
    </HashRouter>
  </React.StrictMode>
);
