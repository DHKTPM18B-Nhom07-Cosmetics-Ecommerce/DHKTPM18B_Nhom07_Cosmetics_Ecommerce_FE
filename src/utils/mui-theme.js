import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    primary: { main: "#0e4f66" },
    error: { main: "#d32f2f" },
  },
  components: {
    MuiFormLabel: {
  styleOverrides: {
    root: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#0e4f66",
      marginBottom: "4px",
      display: "inline-flex",
      alignItems: "center",
      gap: "2px",
    },
    asterisk: {
      color: "#d32f2f !important",
      fontSize: "18px",
      fontWeight: 700,
      marginLeft: "2px",
      lineHeight: 1,
    },
  },
},

    // OPTIONAL: cho MUI TextField label khi focus
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#0e4f66",
          fontWeight: 600,
        },
        shrink: {
          color: "#0e4f66",
          fontWeight: 700,
        },
      },
    },
  },
});
