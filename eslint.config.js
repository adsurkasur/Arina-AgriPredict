import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  // Global ignore patterns
  { ignores: ["dist", ".next", ".next/types", "node_modules", "tailwind.config.ts"] },

  // TypeScript files (project-aware)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
  project: "./tsconfig.json",
  tsconfigRootDir: process.cwd(),
      },
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@next/next": nextPlugin,
    },
    rules: {
      // bring in recommended React hooks rules
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // prefer type-aware unused var rule
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  // JS files: basic checks
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parser: js.parser, // use built-in JS parser from @eslint/js package
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {},
  },
];
