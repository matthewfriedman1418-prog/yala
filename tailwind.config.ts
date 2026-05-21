import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050505",
        charcoal: "#101010",
        panel: "#111111",
        "panel-light": "#181818",
        sand: "#B9915A",
        "light-sand": "#E3C78A",
        gold: "#D6A84F",
        "gold-light": "#F0C97A",
        "gold-dark": "#A07830",
        emerald: {
          DEFAULT: "#10B981",
          dark: "#064E3B",
          light: "#34D399",
        },
        bone: "#F5E8C8",
        muted: "#9CA3AF",
        border: "#1E1E1E",
        "border-gold": "rgba(214,168,79,0.3)",
        "border-emerald": "rgba(16,185,129,0.3)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D6A84F 0%, #F0C97A 50%, #A07830 100%)",
        "emerald-gradient": "linear-gradient(135deg, #064E3B 0%, #10B981 50%, #065F46 100%)",
        "obsidian-gradient": "linear-gradient(180deg, #050505 0%, #0A0A0A 100%)",
        "panel-gradient": "linear-gradient(135deg, rgba(17,17,17,0.9) 0%, rgba(10,10,10,0.95) 100%)",
        "sand-gradient": "linear-gradient(135deg, #B9915A 0%, #E3C78A 100%)",
        "dune-hero": "radial-gradient(ellipse at bottom, #1a0f00 0%, #050505 60%)",
        "oasis-hero": "radial-gradient(ellipse at bottom, #001a0f 0%, #050505 60%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(214,168,79,0.15), 0 0 40px rgba(214,168,79,0.05)",
        "gold-sm": "0 0 10px rgba(214,168,79,0.2)",
        emerald: "0 0 20px rgba(16,185,129,0.15), 0 0 40px rgba(16,185,129,0.05)",
        "emerald-sm": "0 0 10px rgba(16,185,129,0.2)",
        panel: "0 4px 24px rgba(0,0,0,0.4)",
        "panel-lg": "0 8px 48px rgba(0,0,0,0.6)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "pulse-emerald": "pulse-emerald 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin 4s linear infinite",
        "glow-gold": "glow-gold 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-up": "slide-in-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(214,168,79,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(214,168,79,0.5)" },
        },
        "pulse-emerald": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(16,185,129,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(16,185,129,0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-gold": {
          "0%, 100%": { textShadow: "0 0 8px rgba(214,168,79,0.5)" },
          "50%": { textShadow: "0 0 20px rgba(214,168,79,0.9)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
