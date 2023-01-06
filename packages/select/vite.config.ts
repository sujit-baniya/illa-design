import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import typescript from "@rollup/plugin-typescript"

const path = require("path")

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      jsxRuntime: "automatic",
      babel: {
        plugins: ["@emotion/babel-plugin"],
        compact: false,
      },
      // Exclude storybook stories
      exclude: [
        /\.stories\.([tj])sx?$/,
        /\.e2e\.([tj])sx?$/,
        /\.test\.([tj])sx?$/,
      ],
      // Only .tsx files
      include: ["**/*.tsx", "**/*.ts"],
    }),
  ],
  build: {
    sourcemap: true,
    minify: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "@illa-design/select",
      fileName: (format) => `${format}/index.js`,
    },
    rollupOptions: {
      plugins: [
        typescript({
          tsconfig: path.resolve(__dirname, "tsconfig.json"),
          compilerOptions: {
            rootDir: path.resolve(__dirname, "src"),
            outDir: path.resolve(__dirname, "dist", "types"),
            declaration: true,
          },
          include: path.resolve(__dirname, "src/**"),
          exclude: path.resolve(__dirname, "node_modules/**"),
        }),
      ],
      external: [
        "react",
        "react-dom",
        "@emotion/react",
        "framer-motion",
        "@illa-design/icon",
        "@illa-design/empty",
        "@illa-design/trigger",
        "@illa-design/list",
        "@illa-design/input",
        "@illa-design/input-tag",
        "@illa-design/checkbox",
        "@illa-design/theme",
        "@illa-design/system",
        "@illa-design/button",
        "chroma-js",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDom",
          "@emotion/react": "@emotion/react",
          "framer-motion": "framer-motion",
          "@illa-design/icon": "@illa-design/icon",
          "@illa-design/empty": "@illa-design/empty",
          "@illa-design/trigger": "@illa-design/trigger",
          "@illa-design/list": "@illa-design/list",
          "@illa-design/input": "@illa-design/input",
          "@illa-design/input-tag": "@illa-design/input-tag",
          "@illa-design/checkbox": "@illa-design/checkbox",
          "@illa-design/theme": "@illa-design/theme",
          "@illa-design/system": "@illa-design/system",
          "@illa-design/button": "@illa-design/button",
          "chroma-js": "chroma-js",
        },
      },
    },
  },
})
