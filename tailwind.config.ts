import type {Config} from "tailwindcss";
import colors from "tailwindcss/colors";
import formsPlugin from "@tailwindcss/forms";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['var(--font-heebo)', 'Arial', 'sans-serif'],
                'serif': ['var(--font-noto-serif)', 'Georgia', 'serif'],
                'heading': ['var(--font-noto-serif)', 'Georgia', 'serif'],
                'body': ['var(--font-heebo)', 'Arial', 'sans-serif'],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                tremor: {
                    brand: {
                        faint: colors.blue[50],
                        muted: colors.blue[200],
                        subtle: colors.blue[400],
                        DEFAULT: colors.blue[500],
                        emphasis: colors.blue[700],
                        inverted: colors.white,
                    },
                    background: {
                        muted: colors.blue[50],
                        subtle: colors.blue[100],
                        DEFAULT: "rgba(255, 255, 255, 0.8)",
                        emphasis: colors.blue[700],
                    },
                    border: {
                        DEFAULT: colors.blue[200],
                    },
                    ring: {
                        DEFAULT: colors.blue[200],
                    },
                    content: {
                        subtle: colors.blue[400],
                        DEFAULT: colors.blue[500],
                        emphasis: colors.blue[700],
                        strong: colors.blue[900],
                        inverted: colors.white,
                    },
                },
                // dark mode
                "dark-tremor": {
                    brand: {
                        faint: "#0B1229",
                        muted: colors.blue[950],
                        subtle: colors.blue[800],
                        DEFAULT: colors.blue[500],
                        emphasis: colors.blue[400],
                        inverted: colors.blue[950],
                    },
                    background: {
                        muted: "#131A2B",
                        subtle: colors.blue[800],
                        DEFAULT: colors.blue[900],
                        emphasis: colors.blue[300],
                    },
                    border: {
                        DEFAULT: colors.blue[800],
                    },
                    ring: {
                        DEFAULT: colors.blue[800],
                    },
                    content: {
                        subtle: colors.blue[600],
                        DEFAULT: colors.blue[500],
                        emphasis: colors.blue[200],
                        strong: colors.blue[50],
                        inverted: colors.blue[950],
                    },
                },
            },
            boxShadow: {
                // light
                "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                "tremor-card": "0 8px 30px rgb(0 0 0 / 0.04)",
                "tremor-dropdown": "0 8px 30px rgb(0 0 0 / 0.08)",
                // dark
                "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                "dark-tremor-card": "0 8px 30px rgb(0 0 0 / 0.04)",
                "dark-tremor-dropdown": "0 8px 30px rgb(0 0 0 / 0.08)",
            },
            borderRadius: {
                "tremor-small": "0.75rem",
                "tremor-default": "1rem",
                "tremor-full": "9999px",
            },
            fontSize: {
                "tremor-label": ["0.875rem", {lineHeight: "1.25rem"}],
                "tremor-default": ["1rem", {lineHeight: "1.5rem"}],
                "tremor-title": ["1.25rem", {lineHeight: "1.75rem"}],
                "tremor-metric": ["2rem", {lineHeight: "2.5rem"}],
            },
            backdropBlur: {
                "tremor": "8px",
            },
        },
    },
    safelist: [
        {
            pattern:
                /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "data-[selected]"],
        },
        {
            pattern:
                /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "data-[selected]"],
        },
        {
            pattern:
                /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "data-[selected]"],
        },
        {
            pattern:
                /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
        {
            pattern:
                /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
        {
            pattern:
                /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
        },
    ],
    plugins: [formsPlugin],
};
export default config;
