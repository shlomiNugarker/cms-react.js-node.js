import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enables toggling dark mode based on a 'class' added to the root element
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"], // Specifies the files Tailwind should scan for class usage
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))", // Primary color dynamically set via CSS variables
          foreground: "hsl(var(--primary-foreground))", // Text color for elements with primary background
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Secondary color for less prominent elements
          foreground: "hsl(var(--secondary-foreground))", // Text color for secondary background
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // Accent color for highlights or special emphasis
          foreground: "hsl(var(--accent-foreground))", // Text color for accent elements
        },
        background: "hsl(var(--background))", // Main background color
        foreground: "hsl(var(--foreground))", // Main text color
        muted: {
          DEFAULT: "hsl(var(--muted))", // Muted background for subtle areas
          foreground: "hsl(var(--muted-foreground))", // Muted text color
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Color for destructive actions (e.g., delete buttons)
          foreground: "hsl(var(--destructive-foreground))", // Text color for destructive elements
        },
        border: "hsl(var(--border))", // Border color for inputs and containers
        input: "hsl(var(--input))", // Background color for input fields
        ring: "hsl(var(--ring))", // Focus ring color for interactive elements
        card: {
          DEFAULT: "hsl(var(--card))", // Card background color
          foreground: "hsl(var(--card-foreground))", // Text color on cards
        },
        popover: {
          DEFAULT: "hsl(var(--popover))", // Popover background color
          foreground: "hsl(var(--popover-foreground))", // Text color on popovers
        },
        chart: {
          1: "hsl(var(--chart-1))", // Color for the first chart series
          2: "hsl(var(--chart-2))", // Color for the second chart series
          3: "hsl(var(--chart-3))", // Color for the third chart series
          4: "hsl(var(--chart-4))", // Color for the fourth chart series
          5: "hsl(var(--chart-5))", // Color for the fifth chart series
        },
      },
      fontFamily: {
        sans: [
          "Inter", // Default sans-serif font for modern designs
          "Arial",
          "sans-serif",
        ],
        serif: [
          "Georgia", // Serif font for formal or traditional designs
          "serif",
        ],
        mono: [
          "Courier New", // Monospace font for coding or technical text
          "monospace",
        ],
      },
      screens: {
        xs: "480px", // Extra small screens
        sm: "640px", // Small screens (e.g., phones)
        md: "768px", // Medium screens (e.g., tablets)
        lg: "1024px", // Large screens (e.g., laptops)
        xl: "1280px", // Extra large screens (e.g., desktops)
        "2xl": "1536px", // Extra-extra large screens (e.g., large desktops)
      },
      spacing: {
        1: "4px", // Small padding or margin
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px", // Medium padding or margin
        10: "40px", // Large padding or margin
      },
      zIndex: {
        0: "0", // Default stack level
        10: "10",
        50: "50",
        100: "100", // High stack level
        "-5": "-5", // Negative stack level
      },
      width: {
        "screen-90": "90vw", // 90% of the viewport width
        card: "300px", // Fixed width for card components
      },
      height: {
        "screen-80": "80vh", // 80% of the viewport height
        banner: "500px", // Fixed height for banner components
      },
      transitionDuration: {
        0: "0ms", // No transition
        200: "200ms", // Short transition
        500: "500ms", // Long transition
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0", // Fully transparent
          },
          "100%": {
            opacity: "1", // Fully visible
          },
        },
      },
      animation: {
        fadeIn: "fadeIn 1s ease-in-out", // Smooth fade-in effect
      },
      borderRadius: {
        none: "0", // No border radius
        sm: "calc(var(--radius) - 4px)", // Slightly smaller than the default radius
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)", // Default radius
        full: "9999px", // Fully rounded corners (e.g., circles)
      },
      opacity: {
        0: "0", // Fully transparent
        20: "0.2",
        50: "0.5", // 50% opacity
        80: "0.8",
        100: "1", // Fully opaque
      },
    },
  },
  plugins: [tailwindcssAnimate], // Adds animation utilities and keyframes
};
