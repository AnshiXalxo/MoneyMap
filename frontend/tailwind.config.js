/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        dark: {
          900: "#080C14",
          800: "#0D1421",
          700: "#111927",
          600: "#1A2535",
          500: "#243042",
        },
        accent: {
          green: "#00E5A0",
          blue: "#3B82F6",
          red: "#FF4757",
          yellow: "#FFD93D",
          purple: "#A855F7",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(0, 229, 160, 0.15)",
        "glow-red": "0 0 20px rgba(255, 71, 87, 0.15)",
      },
    },
  },
  plugins: [],
};
