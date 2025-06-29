interface Stopwatch {lab(label: string): void}

export const stopwatch = (level: "debug" | "info" = "debug"): Stopwatch => {
    const startTime = performance.now()
    return {
        lab: (label: string) =>
            console[level].call(console, `${label} in ${(performance.now() - startTime).toFixed(1)}ms`)
    }
}