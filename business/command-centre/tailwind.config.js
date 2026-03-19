/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#fafafa",
        primary: "#5865F2",
        "primary-hover": "#4752C4",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        muted: "#71717a",
        card: "#18181b",
        "card-border": "#27272a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
