/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        jucso: {
          navy: "#1B2B6B",
          "navy-dark": "#0D1A3E",
          teal: "#00B4C6",
          gold: "#F5A623",
          slate: "#F4F6FA",
        },
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(27, 43, 107, 0.06)",
        "card-hover": "0 8px 24px rgba(27, 43, 107, 0.1)",
      },
    },
  },
  plugins: [],
};
