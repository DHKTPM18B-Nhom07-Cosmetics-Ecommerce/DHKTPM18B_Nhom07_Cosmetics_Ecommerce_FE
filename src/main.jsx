import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// IMPORT MUI THEME
import { ThemeProvider } from "@mui/material/styles";
import { muiTheme } from "./utils/mui-theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
