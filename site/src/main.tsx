import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { StationProgressProvider } from "./context/StationProgress";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StationProgressProvider>
        <App />
      </StationProgressProvider>
    </BrowserRouter>
  </React.StrictMode>
);
