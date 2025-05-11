// Import required modules
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import nextPlugin from "@next/eslint-plugin-next"
import prettierPlugin from "eslint-plugin-prettier"
import prettierConfig from "eslint-config-prettier"

// Export the ESLint flat config
export default [
    // Use ESLint recommended rules as base
    js.configs.recommended,

    // Add TypeScript support
    ...tseslint.configs.recommended,

    // Configure language options for TypeScript and JSX
    {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                    tsx: true
                }
            },
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                // Node globals
                process: "readonly",
                // React globals
                React: "readonly",
                JSX: "readonly"
            }
        }
    },

    // React configuration
    {
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooksPlugin
        },
        settings: {
            react: {
                version: "detect"
            }
        },
        rules: {
            // React rules
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn"
        }
    },

    // Next.js configuration
    {
        plugins: {
            "@next/next": nextPlugin
        },
        rules: {
            // Disable Next.js legacy image and link rules for Next.js 13+ (App Router)
            "@next/next/no-img-element": "off",
            "@next/next/no-html-link-for-pages": "off",
            // Allow use of server components and client components in Next.js 15
            "@next/next/no-sync-scripts": "off",
            "@next/next/no-document-import-in-page": "off",
            "@next/next/no-head-element": "off"
        }
    },

    // Prettier configuration
    {
        plugins: {
            prettier: prettierPlugin
        },
        rules: {
            "prettier/prettier": "error",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "warn"
        }
    },

    // Apply prettier config last
    prettierConfig,

    // Files to include/exclude
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        ignores: ["**/node_modules/**", "**/.next/**", "**/out/**", "**/dist/**"]
    }
]
