import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  // Global ignore patterns
  { ignores: ["dist", ".next", ".next/types", "node_modules"] },

  // TypeScript files (project-aware)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
  project: "./tsconfig.json",
        tsconfigRootDir: new URL(".", import.meta.url).pathname,
      },
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // bring in recommended React hooks rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // prefer type-aware unused var rule
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  // JS files: basic checks
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parser: js.parsers.Babel, // use built-in JS parser from @eslint/js package
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {},
  },
];
