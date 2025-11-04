// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";   // 👈 added
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 👇 React Router wrapper */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
