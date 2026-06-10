import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx},ls,jsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        austinBlue: "#00B8D2",
        austinGold: "#FDA305",
        austinDeepBlue: "#1A7EB2",
        austinBrown: "#734812",
        austinBurnt: "#C3811F",
      },
    },
  },
  plugins: [],
};

export default config;