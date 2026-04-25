/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ enables dark mode toggle
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d6e6ff",
          500: "#3b82f6", // CollaboraPro blue
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
