import { createConfig } from "@cyber/config/eslint";

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  project: ["./tsconfig.json"],
});
