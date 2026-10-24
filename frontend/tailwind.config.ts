import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f1f6f3",
          100: "#dfebe3",
          200: "#bfd6c8",
          300: "#96b9a5",
          400: "#6b9780",
          500: "#4c7a63",
          600: "#39614d",
          700: "#2f4e3f",
          800: "#1f3a2e", // primary deep forest green
          900: "#152c22",
          950: "#0b1a15",
        },
        sage: {
          50: "#f5f8f4",
          100: "#e7efe2",
          200: "#cfdfc5",
          300: "#aecaa0",
          400: "#8bb077",
          500: "#6f9757",
          600: "#577842",
        },
        cream: {
          DEFAULT: "#faf7f0",
          50: "#fdfcf9",
          100: "#faf7f0",
          200: "#f3ecdc",
        },
        ink: {
          900: "#16201a",
          700: "#2b362f",
          500: "#54604f",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(22, 32, 26, 0.04), 0 8px 24px -12px rgba(22, 32, 26, 0.12)",
        cardHover: "0 2px 4px rgba(22, 32, 26, 0.06), 0 16px 32px -14px rgba(22, 32, 26, 0.18)",
      },
      maxWidth: {
        "8xl": "90rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
