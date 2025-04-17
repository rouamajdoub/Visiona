import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

//color design token
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        // DARK MODE COLORS - Should be darker shades
        grey: {
          100: "#f5f5f5", // Lightest
          200: "#e0e0e0",
          300: "#c2c2c2",
          400: "#a3a3a3",
          500: "#858585",
          600: "#666666",
          700: "#474747",
          800: "#292929",
          900: "#0a0a0a", // Darkest
        },
        primary: {
          100: "#d1d3dc",
          200: "#a3a8b9",
          300: "#757c95",
          400: "#475172",
          500: "#19254f",
          600: "#141e3f",
          700: "#0f162f",
          800: "#0a0f20",
          900: "#050710",
        },
        blueAccent: {
          100: "#d6dce5",
          200: "#acb9cb",
          300: "#8395b2",
          400: "#597298",
          500: "#304f7e",
          600: "#263f65",
          700: "#1d2f4c",
          800: "#132032",
          900: "#0a1019",
        },
        yellowAccent: {
          100: "#f5f4f1",
          200: "#ece9e3",
          300: "#e2ddd6",
          400: "#d9d2c8",
          500: "#cfc7ba",
          600: "#a69f95",
          700: "#7c7770",
          800: "#53504a",
          900: "#292825",
        },
        bleuAcc: {
          100: "#dadeea",
          200: "#b6bcd5",
          300: "#919bc0",
          400: "#6d79ab",
          500: "#485896",
          600: "#3a4678",
          700: "#2b355a",
          800: "#1d233c",
          900: "#0e121e",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
      }
    : {
        // LIGHT MODE COLORS - Should be lighter shades
        grey: {
          900: "#f5f5f5", // Lightest (reversed order)
          800: "#e0e0e0",
          700: "#c2c2c2",
          600: "#a3a3a3",
          500: "#858585",
          400: "#666666",
          300: "#474747",
          200: "#292929",
          100: "#0a0a0a", // Darkest (reversed order)
        },
        primary: {
          900: "#d1d3dc",
          800: "#a3a8b9",
          700: "#757c95",
          600: "#475172",
          500: "#19254f", // Main color
          400: "#141e3f",
          300: "#0f162f",
          200: "#0a0f20",
          100: "#050710",
        },
        blueAccent: {
          900: "#d6dce5",
          800: "#acb9cb",
          700: "#8395b2",
          600: "#597298",
          500: "#304f7e", // Main color
          400: "#263f65",
          300: "#1d2f4c",
          200: "#132032",
          100: "#0a1019",
        },
        yellowAccent: {
          900: "#f5f4f1",
          800: "#ece9e3",
          700: "#e2ddd6",
          600: "#d9d2c8",
          500: "#cfc7ba", // Main color
          400: "#a69f95",
          300: "#7c7770",
          200: "#53504a",
          100: "#292825",
        },
        bleuAcc: {
          900: "#dadeea",
          800: "#b6bcd5",
          700: "#919bc0",
          600: "#6d79ab",
          500: "#485896", // Main color
          400: "#3a4678",
          300: "#2b355a",
          200: "#1d233c",
          100: "#0e121e",
        },
        greenAccent: {
          900: "#dbf5ee",
          800: "#b7ebde",
          700: "#94e2cd",
          600: "#70d8bd",
          500: "#4cceac", // Main color
          400: "#3da58a",
          300: "#2e7c67",
          200: "#1e5245",
          100: "#0f2922",
        },
        redAccent: {
          900: "#f8dcdb",
          800: "#f1b9b7",
          700: "#e99592",
          600: "#e2726e",
          500: "#db4f4a", // Main color
          400: "#af3f3b",
          300: "#832f2c",
          200: "#58201e",
          100: "#2c100f",
        },
      }),
});

//mui theme setting
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            // DARK MODE
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.yellowAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#121212", // Dark background
            },
          }
        : {
            // LIGHT MODE
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.yellowAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#f8f8f8", // Light background
            },
          }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
