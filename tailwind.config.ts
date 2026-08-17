import type { Config } from "tailwindcss";

/**
 * Paleta e tipografia derivadas de duas fontes de verdade:
 *  1. o board de tipografia da campanha (Noka Medium/Black + logotipo "futï");
 *  2. o CSS de produção de https://www.biscoite.com.br/.
 *
 * Ver BRAND.md para a origem de cada valor e as regras de uso.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Azul-marinho institucional da Biscoitê — cor mais frequente do site.
        ink: "#0A192F",
        // Azul da campanha, amostrado do board de tipografia.
        navy: {
          DEFAULT: "#213B6E",
          deep: "#16294A",
        },
        steel: {
          DEFAULT: "#5881A5",
          soft: "#6580A2",
        },
        sky: {
          DEFAULT: "#BED7E7",
          light: "#9EBDE4",
        },
        paper: "#F5F5F5",
        line: "#E0E0E0",
        alert: "#A21D2D",
      },
      fontFamily: {
        // Uma única família em todo o site — o board não prevê segunda voz.
        noka: ["var(--font-noka)"],
      },
      letterSpacing: {
        headline: "0.01em",
        label: "0.16em",
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        floatUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        floatUp: "floatUp 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
