/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta de DobleClick (el ISP real para el que es este proyecto): azul dominante
        // en header/hero/acciones principales, verde como acento para CTAs destacados.
        primary: {
          DEFAULT: "#1B6FC9",
          dark: "#122C56",
        },
        accent: {
          DEFAULT: "#7CB342",
          dark: "#5E8C2F",
        },
        surface: "#F8FAFC",
      },
    },
  },
  plugins: [],
};
