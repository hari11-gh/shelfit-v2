/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "space-bg": "#050014",
        "space-panel": "#0b1022",
        "space-panel-soft": "#131633",
        "space-accent": "#8b5cf6",
        "space-accent-soft": "#6366f1",
      },
      boxShadow: {
        "space-soft": "0 18px 40px rgba(0,0,0,0.75)",
      },
      borderRadius: {
        "xl2": "1.25rem",
      },
    },
  },
  plugins: [],
};
