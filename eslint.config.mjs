import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cliente de Prisma autogenerado (ver CLAUDE.md) — no es código de la app.
    "app/generated/**",
    // Output de build local de Netlify (gitignored, no es código de la app).
    ".netlify/**",
  ]),
]);

export default eslintConfig;
