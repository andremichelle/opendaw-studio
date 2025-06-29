import {tryCatch} from "opendaw-std"

const requireProperty = <T extends {}>(object: T, key: keyof T): void => {
    const {status, value} = tryCatch(() => object instanceof Function ? object.name : object.constructor.name)
    const feature = status === "failure" ? `${object}.${String(key)}` : `${value}.${String(key)}`
    console.debug(`%c${feature}%c available`, "color: hsl(200, 83%, 60%)", "color: inherit")
    if (!(key in object)) {throw feature}
}

export const testFeatures = async (): Promise<void> => {
    requireProperty(Promise, "withResolvers")
    requireProperty(window, "indexedDB")
    requireProperty(window, "AudioWorkletNode")
    requireProperty(navigator, "storage")
    requireProperty(navigator.storage, "getDirectory")
    requireProperty(crypto, "randomUUID")
    requireProperty(crypto, "subtle")
    requireProperty(crypto.subtle, "digest")
}