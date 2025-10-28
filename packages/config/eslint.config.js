import js from "@eslint/js";
import tseslint from "typescript-eslint";

const baseIgnores = [
  "**/dist/**",
  "**/node_modules/**",
  "**/.pnpm/**",
  "**/eslint.config.js"
];

/**
 * @param {{ tsconfigRootDir?: string; project?: string[] }} options
 * @returns {import("eslint").Linter.FlatConfig[]}
 */
export function createConfig(options = {}) {
  const { tsconfigRootDir = process.cwd(), project = ["./tsconfig.json"] } = options;

  const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project,
        tsconfigRootDir,
      },
    },
  }));

  return [
    {
      ignores: baseIgnores,
    },
    js.configs.recommended,
    ...typeCheckedConfigs,
    {
      rules: {
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "prefer-const": ["error", { destructuring: "all" }],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/require-await": "off"
      },
    },
  ];
}

export default createConfig();
