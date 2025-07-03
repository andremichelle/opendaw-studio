import {defineConfig} from "tsup"

export default defineConfig([
    {
        entry: ["src/index.ts"],
        format: ["esm", "cjs"],
        dts: true,
        clean: true,
        sourcemap: true,
    },
    {
        entry: ["src/EngineProcessor.ts"],
        format: ["esm"],
        dts: true,
        sourcemap: true,
        outDir: "dist/worker",
        platform: "browser",
        minify: true,
    }
]) 