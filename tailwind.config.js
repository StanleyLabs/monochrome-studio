/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D12",
        paper: "#EEF2FF",
        fog: "#A7B0C6",
        electric: "#2D6BFF",
        hot: "#FF3B3B",
        graphite: "#11151F",
        mint: "#2EF2C2",
      },
      boxShadow: {
        insetHairline: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

