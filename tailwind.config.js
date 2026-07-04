/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF5",
          100: "#FBF6EC",
          200: "#F5EBD8",
          300: "#EEDFC2",
        },
        ink: {
          DEFAULT: "#3D3227",
          soft: "#6B5D4C",
          faint: "#98897A",
        },
        wood: {
          light: "#B08968",
          DEFAULT: "#8B5E3C",
          dark: "#6B4226",
        },
        ember: {
          light: "#F6C066",
          DEFAULT: "#E8A33D",
          deep: "#C97F1B",
        },
        moss: {
          light: "#A3C585",
          DEFAULT: "#7A9E5F",
          deep: "#587A42",
        },
        skyblue: {
          light: "#B5D2E8",
          DEFAULT: "#7FA7C9",
          deep: "#5B87AC",
        },
        plum: {
          light: "#C8B3E0",
          DEFAULT: "#9B7EBD",
          deep: "#7A5C9E",
        },
        stone2: "#8F887B",
      },
      fontFamily: {
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans SC",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(107, 66, 38, 0.08)",
        card: "0 4px 20px rgba(107, 66, 38, 0.10)",
        glow: "0 0 18px rgba(232, 163, 61, 0.45)",
        "glow-strong": "0 0 28px rgba(232, 163, 61, 0.65)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { transform: "scale(1) rotate(-1.5deg)", opacity: "1" },
          "50%": { transform: "scale(1.08) rotate(1.5deg)", opacity: "0.9" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(1.65)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        drift: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(12px)" },
        },
      },
      animation: {
        flicker: "flicker 2.2s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        floaty: "floaty 4s ease-in-out infinite",
        drift: "drift 9s ease-in-out infinite",
        bob: "bob 2.4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
      },
    },
  },
  plugins: [],
};
