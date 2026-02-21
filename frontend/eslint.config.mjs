import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import sonarjs from "eslint-plugin-sonarjs";
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import react from "eslint-plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // TypeScript files with type-aware linting
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { sonarjs, import: importPlugin, unicorn, react },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/prefer-optional-chain": "warn",
      "import/no-duplicates": "error",
      "react/no-multi-comp": "warn",
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-element-overwrite": "error",
      "sonarjs/no-empty-collection": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-ignored-return": "error",
      "sonarjs/no-use-of-empty-return-value": "error",
      "sonarjs/non-existent-operator": "error",
      "sonarjs/cognitive-complexity": ["warn", 15],
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-duplicate-string": "warn",
      "sonarjs/no-duplicated-branches": "warn",
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/no-nested-switch": "warn",
      "sonarjs/no-nested-template-literals": "warn",
      "sonarjs/no-redundant-boolean": "warn",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/prefer-object-literal": "warn",
      "sonarjs/prefer-single-boolean-return": "warn",
      "sonarjs/prefer-while": "warn",
      "unicorn/no-negated-condition": "warn",
    },
  },
  // UI components - allow multiple exports per file (must come after main config)
  {
    files: ["src/components/ui/**/*.tsx"],
    rules: {
      "react/no-multi-comp": "off",
    },
  },
];

export default eslintConfig;
