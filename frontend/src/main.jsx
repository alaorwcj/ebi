import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ThemedToaster from "./components/ThemedToaster.jsx";
import App from "./App.jsx";
import "./styles.css";

// HMR Pulse Trigger
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ThemedToaster />
    </BrowserRouter>
  </React.StrictMode>
);
