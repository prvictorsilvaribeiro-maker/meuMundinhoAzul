import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#12233F", soft: "#5A6B85" },
        paper: "#F2F6FB",
        sky: { DEFAULT: "#7FB3E3", deep: "#2F6FB5", wash: "#DEEBF8" },
        mint: "#3FA88E",
        amber: "#E8A33D",
        alerta: "#C0562F",
        linha: "#DFE7F1",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: { card: "18px" },
    },
  },
  plugins: [],
};
export default config;
