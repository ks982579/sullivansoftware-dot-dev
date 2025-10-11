import { createTheme } from "@mui/material/styles";

// Japanese Retro Theme
// Inspired by: 1980s Sony tech, vintage Tokyo neon, retro futurism
// Color palette: Warm creams, deep burgundy, forest green, burnt orange accents

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8B4513", // Saddle brown - vintage leather/wood tones
      light: "#C19A6B", // Tan - lighter retro beige
      dark: "#5C2E0A", // Dark brown
      contrastText: "#FFF8DC", // Cornsilk - soft off-white
    },
    secondary: {
      main: "#2F4F4F", // Dark slate gray - vintage electronics
      light: "#527F7F", // Lighter slate
      dark: "#1C3030", // Deep forest
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#D32F2F", // Keep standard for accessibility
    },
    warning: {
      main: "#FF6F00", // Burnt orange - retro warm accent
    },
    info: {
      main: "#0288D1", // Retro tech blue
    },
    success: {
      main: "#388E3C", // Forest green
    },
    background: {
      default: "#FFF8DC", // Cornsilk - warm vintage paper
      paper: "#FFFAF0", // Floral white - slightly warmer
    },
    text: {
      primary: "#2C1810", // Very dark brown - almost black
      secondary: "#5C4033", // Medium brown
    },
  },
  typography: {
    fontFamily: [
      // Modern clean fonts with a retro geometric feel
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
      fontSize: "3.5rem",
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: "2.5rem",
      letterSpacing: "-0.01em",
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: "2rem",
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.25rem",
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 4, // Subtle rounded corners - retro clean
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Modern, clean text
          fontWeight: 600,
          borderRadius: 6,
          padding: "10px 24px",
        },
        contained: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Flat design
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        elevation2: {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
        elevation3: {
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid rgba(92, 46, 10, 0.1)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

// Tailwind theme extension for consistency
export const tailwindTheme = {
  colors: {
    primary: {
      DEFAULT: "#8B4513",
      light: "#C19A6B",
      dark: "#5C2E0A",
    },
    secondary: {
      DEFAULT: "#2F4F4F",
      light: "#527F7F",
      dark: "#1C3030",
    },
    accent: {
      orange: "#FF6F00",
      blue: "#0288D1",
      green: "#388E3C",
    },
    background: {
      DEFAULT: "#FFF8DC",
      paper: "#FFFAF0",
    },
    text: {
      primary: "#2C1810",
      secondary: "#5C4033",
    },
  },
};
