export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        spotify: { green: "#1DB954", green2: "#1ED760", black: "#121212", dark: "#191414" },
      },
      fontFamily: { poppins: ["Poppins", "ui-sans-serif", "system-ui"] },
    },
  },
  plugins: [],
}