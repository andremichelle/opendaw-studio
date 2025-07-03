import {defineConfig} from "vite"
import compression from "vite-plugin-compression"
import crossOriginIsolation from "vite-plugin-cross-origin-isolation"
import fs from "fs"
import path from "path"

const workspacePackages = [
    "lib-std", "lib-box", "lib-dom", "lib-dsp", "lib-runtime", "lib-jsx", "lib-fusion",
    "studio-adapters", "studio-boxes", "studio-enums", "studio-worklet-main", "studio-worklet-runtime"
]
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        },
        // Force deduplication of all workspace packages
        dedupe: workspacePackages
    },

    optimizeDeps: {
        // Include all workspace packages for pre-bundling
        include: workspacePackages,
        // Force fresh dependency analysis  
        force: true,
        // Don't exclude any workspace packages
        exclude: [],
        esbuildOptions: {
            // Ensure consistent module format
            format: "esm",
            target: "esnext",
            keepNames: true,
            // Force single instance of modules
            mainFields: ["module", "main"]
        }
    },

    define: {
        __DEV__: JSON.stringify(false),
        __PROD__: JSON.stringify(true)
    },

    build: {
        target: "esnext",
        rollupOptions: {
            // Don't externalize workspace packages - bundle them
            external: (id: string) => {
                // Never externalize workspace packages
                if (workspacePackages.some(pkg => id.includes(`/${pkg}/`))) {
                    return false
                }
                return false
            },
            output: {
                // Ensure workspace packages are in the same chunk
                manualChunks: (id: string) => {
                    // Group all workspace packages together
                    if (workspacePackages.some(pkg => id.includes(`/${pkg}/`))) {
                        return "vendor-workspace"
                    }
                    // Group external node_modules
                    if (id.includes("node_modules")) {
                        return "vendor-external"
                    }
                }
            }
        },
        sourcemap: true
    },

    server: {
        port: 8080,
        host: "localhost",
        https: {
            key: fs.readFileSync("../../../localhost-key.pem"),
            cert: fs.readFileSync("../../../localhost.pem")
        },
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        },
        fs: {
            // Allow serving files from the entire workspace
            allow: [".."]
        }
    },

    plugins: [
        crossOriginIsolation(),
        compression({
            algorithm: "brotliCompress",
            ext: ".br",
            threshold: 1024
        }),
        {
            name: "workspace-watcher",
            configureServer(server) {
                const watchPaths = workspacePackages.flatMap(pkg => [
                    path.resolve(__dirname, `../../libraries/${pkg.replace("lib-", "")}/dist`),
                    path.resolve(__dirname, `../../studio/${pkg.replace("studio-", "")}/dist`)
                ]).filter(dir => {
                    try {
                        return fs.statSync(dir).isDirectory()
                    } catch {
                        return false
                    }
                })

                watchPaths.forEach(dir => {
                    try {
                        server.watcher.add(dir)
                        console.log(`Watching package: ${path.relative(process.cwd(), dir)}`)
                    } catch (error: any) {
                        console.log(`Could not watch ${path.relative(process.cwd(), dir)}: ${error.message}`)
                    }
                })

                server.ws.on("connection", () => {
                    watchPaths.forEach(dir => {
                        fs.watch(dir, {recursive: false}, (eventType, filename) => {
                            if (filename?.endsWith(".js") || filename?.endsWith(".mjs")) {
                                console.log(`Package changed: ${path.relative(process.cwd(), path.join(dir, filename))}`)
                                server.ws.send({
                                    type: "full-reload"
                                })
                            }
                        })
                    })
                })
            }
        }
    ],
    worker: {
        format: "es",
        plugins: () => []
    }
})