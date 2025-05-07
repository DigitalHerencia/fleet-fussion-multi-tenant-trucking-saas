import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsx from "eslint-plugin-jsx-a11y"
import prettier from "eslint-plugin-prettier"
import json from "@eslint/json"
import markdown from "@eslint/markdown"
import css from "@eslint/css"
import next from "eslint-plugin-next"
import { defineConfig } from "eslint/config"

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        plugins: {
            js,
            prettier,
            "react-hooks": reactHooks,
            "jsx-a11y": jsx,
            next
        },
        extends: ["js/recommended", "plugin:next/recommended"],
        settings: {
            react: {
                version: "detect"
            }
        },
        rules: {
            "prettier/prettier": "error",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "no-unused-vars": "warn",
            "no-console": ["warn", { allow: ["warn", "error"] }]
        }
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true
                }
            }
        }
    },
    tseslint.configs.recommended,
    {
        ...pluginReact.configs.flat.recommended,
        rules: {
            ...pluginReact.configs.flat.recommended.rules,
            "react/react-in-jsx-scope": "off", // Not needed in Next.js
            "react/prop-types": "off", // We use TypeScript
            "react/jsx-filename-extension": ["warn", { extensions: [".jsx", ".tsx"] }]
        }
    },
    {
        files: ["**/*.json"],
        plugins: { json },
        language: "json/json",
        extends: ["json/recommended"]
    },
    {
        files: ["**/*.jsonc"],
        plugins: { json },
        language: "json/jsonc",
        extends: ["json/recommended"]
    },
    {
        files: ["**/*.json5"],
        plugins: { json },
        language: "json/json5",
        extends: ["json/recommended"]
    },
    {
        files: ["**/*.md"],
        plugins: { markdown },
        language: "markdown/gfm",
        extends: ["markdown/recommended"]
    },
    { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] }
])
