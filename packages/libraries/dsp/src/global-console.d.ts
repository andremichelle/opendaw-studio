// This global definition ensures TypeScript recognizes the `console` object,
// even when compiling without DOM lib definitions.
// This definition avoids the need to include unwanted DOM types,
// while still allowing use of `console.log`, `console.warn`, etc. in the codebase.
declare var console: {
    log: (...args: any[]) => void
    debug: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    [key: string]: (...args: any[]) => void
}