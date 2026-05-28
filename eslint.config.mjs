import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs    from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  {
    rules: {
      // ── React 19 / React Compiler rules ──
      // These are too strict for standard patterns (useEffect + setState,
      // window.location assignments, function hoisting in components).
      "react-hooks/immutability":         "off",
      "react-hooks/set-state-in-effect":  "off",

      // ── TypeScript ──
      // Supabase returns untyped joins — any is necessary in several places.
      "@typescript-eslint/no-explicit-any":  "warn",
      "@typescript-eslint/no-unused-vars":   "warn",

      // ── React ──
      // Legal pages contain natural apostrophes and quotes in English text.
      "react/no-unescaped-entities":   "off",
      // MediaUploader uses <img> intentionally for local file previews.
      "@next/next/no-img-element":     "warn",
    },
  },
]);

export default eslintConfig;
