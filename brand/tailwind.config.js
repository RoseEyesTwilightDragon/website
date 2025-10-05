/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        primary: "hsl(262 83% 58%)",
        border: "hsl(214.3 31.8% 91.4%)",
        muted: "hsl(220 14.3% 95.9%)"
      }
    }
  },
  plugins: []
}
