import { createVuetify } from "vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { de } from "vuetify/locale";

const meineFarben = {
  dark: false,
  colors: {
    background: "#F4F0EE",
    surface: "#FFFFFF",

    primary: "#A1887F",
    secondary: "#D8C1B6",
    accent: "#A7C4BC",

    info: "#5E81AC",
    success: "#718574",
    warning: "#F2C57C",
    error: "#E26D5A",

    onBackground: "#3F3531",
    onSurface: "#3F3531",

    textPrimary: "#3F3531",
    textMuted: "#796B64",

    heroStart: "#E8DDD7",
    heroEnd: "#D3BBB0",

    cardBorder: "#E5DAD5",
    softSurface: "#EDE5E1",
  },
};

const dark = {
  dark: true,
  colors: {
    background: "#171311",
    surface: "#251F1C",

    primary: "#C7A79A",
    secondary: "#7C6258",
    accent: "#93B2A8",

    info: "#75A7C7",
    success: "#89A68C",
    warning: "#D6A85F",
    error: "#D77A6D",

    onBackground: "#F5ECE8",
    onSurface: "#F5ECE8",

    textPrimary: "#F5ECE8",
    textMuted: "#C5B4AD",

    heroStart: "#2C2421",
    heroEnd: "#493832",

    cardBorder: "#493C37",
    softSurface: "#211B18",
  },
};

export default createVuetify({
  theme: {
    defaultTheme: "meineFarben",
    themes: {
      meineFarben,
      dark,
    },
  },
 locale: {
  locale: "de",
  fallback: "de",
  messages: {
    de,
  },
},
});