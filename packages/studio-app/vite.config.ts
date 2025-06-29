import {defineConfig, UserConfig} from "vite"
import {resolve} from "path"
import * as path from "node:path"
import {readFileSync, writeFileSync, watch} from "fs"
import {BuildInfo} from "./src/BuildInfo"
import viteCompression from "vite-plugin-compression"
import crossOriginIsolation from "vite-plugin-cross-origin-isolation"

export const generateUUID = (): string => {
    const format = crypto.getRandomValues(new Uint8Array(16))
    format[6] = (format[6] & 0x0f) | 0x40 // Version 4 (random)
    format[8] = (format[8] & 0x3f) | 0x80 // Variant 10xx for UUID
    const hex: Array<string> = []
    for (let index = 0; index < 256; index++) {
        hex[index] = (index + 0x100).toString(16).substring(1)
    }
    return hex[format[0]] + hex[format[1]] +
        hex[format[2]] + hex[format[3]] + "-" +
        hex[format[4]] + hex[format[5]] + "-" +
        hex[format[6]] + hex[format[7]] + "-" +
        hex[format[8]] + hex[format[9]] + "-" +
        hex[format[10]] + hex[format[11]] +
        hex[format[12]] + hex[format[13]] +
        hex[format[14]] + hex[format[15]]
}

export default defineConfig(({mode, command}) => {
    const uuid = generateUUID()
    const env = process.env.NODE_ENV as BuildInfo["env"]
    const date = Date.now()
    const config: UserConfig = {
        base: "/",
        mode,
        plugins: [
            crossOriginIsolation(),
            {
                name: "generate-date-json",
                buildStart() {
                    const outputPath = resolve(__dirname, "public", "build-info.json")
                    writeFileSync(outputPath, JSON.stringify({date, uuid, env} satisfies BuildInfo, null, 2))
                    console.debug(`Build info written to: ${outputPath}`)
                }
            },
            {
                name: "spa",
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        const url: string | undefined = req.url
                        if (url !== undefined && url.indexOf(".") === -1 && !url.startsWith("/@vite/")) {
                            const indexPath = path.resolve(__dirname, "index.html")
                            res.end(readFileSync(indexPath))
                        } else {
                            next()
                        }
                    })
                }
            },
            {
                name: "watch-packages",
                configureServer(server) {
                    if (command === "serve") {
                        // Watch package dist folders for changes
                        const packagePaths = [
                            "../lib-std/dist",
                            "../lib-box/dist", 
                            "../lib-dom/dist",
                            "../lib-dsp/dist",
                            "../lib-runtime/dist",
                            "../lib-jsx/dist",
                            "../lib-fusion/dist",
                            "../studio-shared/dist",
                            "../studio-boxes/dist",
                            "../studio-enums/dist",
                            "../studio-worklet/dist"
                        ]
                        
                        packagePaths.forEach(pkgPath => {
                            const fullPath = resolve(__dirname, pkgPath)
                            try {
                                watch(fullPath, { recursive: true }, (eventType, filename) => {
                                    if (filename && !filename.endsWith('.map')) {
                                        console.log(`Package changed: ${pkgPath}/${filename}`)
                                        // Trigger a full page reload when packages change
                                        server.ws.send({
                                            type: 'full-reload',
                                            path: '*'
                                        })
                                    }
                                })
                                console.log(`Watching package: ${pkgPath}`)
                            } catch (error) {
                                console.warn(`Could not watch ${pkgPath}:`, error)
                            }
                        })
                    }
                }
            },
            viteCompression({
                algorithm: "brotliCompress"
            })
        ],
        resolve: {
            alias: {
                "@": resolve(__dirname, "./src"),
                "studio-worklet": resolve(__dirname, "../studio-worklet/src"),
            }
        },
        build: {
            target: "esnext",
            minify: true,
            sourcemap: true,
            rollupOptions: {
                output: {
                    format: "es",
                    entryFileNames: `[name].${uuid}.js`,
                    chunkFileNames: `[name].${uuid}.js`,
                    assetFileNames: `[name].${uuid}.[ext]`
                }
            }
        },
        esbuild: {
            target: "esnext"
        },
        clearScreen: false
    }
    if (command === "serve") {
        config.server = {
            port: 8080,
            strictPort: true,
            https: {
                key: readFileSync(resolve(__dirname, "../../localhost-key.pem")),
                cert: readFileSync(resolve(__dirname, "../../localhost.pem"))
            },
            watch: {
                ignored: ["**/src-tauri/**"]
            }
        }
    }
    return config
})