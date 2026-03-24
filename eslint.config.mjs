import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier"; // 1. Import Prettier config

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // 2. Masukkan konfigurasi Prettier (harus diletakkan setelah config Next.js)
  eslintConfigPrettier,

  // 3. Tambahkan objek untuk aturan kustom tim Anda
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
