import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#FAF8F5",
          inset: "#F5F2EB",
          card: "#FFFFFF",
        },
        charcoal: {
          DEFAULT: "#262421",
          deep: "#1A1917",
          muted: "#4A4742",
        },
        driftwood: {
          DEFAULT: "#736F68",
          light: "#9A968F",
          dark: "#57534D",
        },
        terracotta: {
          DEFAULT: "#C85A32",
          hover: "#B24F2C",
          light: "#FBEFEA",
          dark: "#9E4120",
        },
        sage: {
          DEFAULT: "#437A5B",
          hover: "#38664C",
          light: "#EDF4EE",
          dark: "#2C523C",
        },
        stone: {
          border: "#E7E2DA",
          muted: "#DDD7CD",
        },
      },
      fontFamily: {
        serif: ["Martel", "Noto Serif Devanagari", "Newsreader", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Noto Sans Devanagari", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "Courier New", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        warm: "0 2px 8px -2px rgba(38, 36, 33, 0.05), 0 1px 4px -1px rgba(38, 36, 33, 0.03)",
        "warm-md": "0 6px 16px -4px rgba(38, 36, 33, 0.08), 0 2px 6px -2px rgba(38, 36, 33, 0.04)",
        "warm-lg": "0 12px 28px -6px rgba(38, 36, 33, 0.1), 0 4px 12px -2px rgba(38, 36, 33, 0.05)",
      },
      borderRadius: {
        editorial: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
