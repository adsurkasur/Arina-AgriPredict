import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  // Global ignore patterns
  { ignores: ["dist", ".next", ".next/types", "node_modules", "tailwind.config.ts"] },

  // Base configurations
  js.configs.recommended,

  // Next.js configuration
  ...compat.config({
    extends: ['next'],
  }),

  // TypeScript files (project-aware)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Disable no-undef for Node.js globals
      "no-undef": "off",
      // bring in recommended React hooks rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Enable unused vars with proper configuration
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_|^(state|val|value|prevValue|updates|message|messages|typing|config|forecasting|ids|payload|name|props|index)$",
        varsIgnorePattern: "^_|^(state|val|value|prevValue|updates|message|messages|typing|config|forecasting|ids|payload|name|props|index)$",
        ignoreRestSiblings: true,
        caughtErrors: "none"
      }],
      "no-unused-vars": ["error", {
        argsIgnorePattern: "^_|^(state|val|value|prevValue|updates|message|messages|typing|config|forecasting|ids|payload|name|props|index)$",
        varsIgnorePattern: "^_|^(state|val|value|prevValue|updates|message|messages|typing|config|forecasting|ids|payload|name|props|index)$",
        ignoreRestSiblings: true
      }],
    },
  },

  // JS files: basic checks
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {},
  },
];

export default eslintConfig;
