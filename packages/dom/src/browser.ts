// noinspection PlatformDetectionJS

export namespace Browser {
    const hasLocation = typeof self !== "undefined" && "location" in self && typeof self.location !== undefined
    const hasNavigator = typeof self !== "undefined" && "navigator" in self && typeof self.navigator !== undefined
    export const isLocalHost = () => hasLocation && location.host.includes("localhost")
    export const isMacOS = () => hasNavigator && navigator.userAgent.includes("Mac OS X")
    export const isWindows = () => hasNavigator && navigator.userAgent.includes("Windows")
    export const isFirefox = () => hasNavigator && navigator.userAgent.toLowerCase().includes("firefox")
    export const isWeb = () => !isTauriApp()
    export const isTauriApp = () => "__TAURI__" in window
    export const userAgent = hasNavigator ? navigator.userAgent
        .replace(/^Mozilla\/[\d.]+\s*/, "")
        .replace(/\bAppleWebKit\/[\d.]+\s*/g, "")
        .replace(/\(KHTML, like Gecko\)\s*/g, "")
        .replace(/\bSafari\/[\d.]+\s*/g, "")
        .replace(/\s+/g, " ")
        .trim() : "N/A"
}