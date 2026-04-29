import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#05070d",
          subtle: "#0a0e18",
          raised: "#0f1422",
        },
        ink: {
          DEFAULT: "#e7ecf5",
          muted: "#9aa6bd",
          dim: "#5e6a85",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
        accent: {
          DEFAULT: "#6ee7a8",
          strong: "#22c55e",
          glow: "#34d399",
        },
        navy: {
          900: "#05070d",
          800: "#0a0e18",
          700: "#0f1422",
          600: "#141a2c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(110,231,168,0.12), transparent 60%), radial-gradient(ellipse at bottom, rgba(56,189,248,0.10), transparent 60%)",
        "mesh":
          "radial-gradient(at 20% 10%, rgba(110,231,168,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(56,189,248,0.18) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(168,85,247,0.18) 0px, transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(110,231,168,0.25), 0 10px 40px -10px rgba(110,231,168,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(0,0,0,0.6)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
