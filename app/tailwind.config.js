/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        card: "#18181b",
        "card-foreground": "#fafafa",
        primary: "#fafafa",
        "primary-foreground": "#18181b",
        secondary: "#27272a",
        "secondary-foreground": "#fafafa",
        muted: "#27272a",
        "muted-foreground": "#a1a1aa",
        accent: "#27272a",
        "accent-foreground": "#fafafa",
        destructive: "#ef4444",
        border: "#27272a",
        input: "#27272a",
        ring: "#d4d4d8",
      },
    },
  },
  plugins: [],
}