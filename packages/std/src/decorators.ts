import {asDefined, panic} from "./lang"

const findMethodType = (descriptor: PropertyDescriptor): "get" | "set" | "value" => {
    if (descriptor.value !== undefined) {return "value"}
    if (descriptor.get !== undefined) {return "get"}
    return panic(`Cannot resolve method key of ${descriptor}`)
}

export const Lazy = (_: any, property: string, descriptor: PropertyDescriptor): any => {
    const methodType = findMethodType(descriptor)
    const element = asDefined(descriptor[methodType])
    return {
        [methodType]: function (...args: []): any {
            if (args.length > 0) {
                return panic("lazy accessory must not have any construction parameters")
            }
            const value = element.apply(this)
            Object.defineProperty(this, property, {
                value: methodType === "get" ? value : () => value,
                configurable: false,
                writable: false,
                enumerable: false
            })
            return value
        }
    }
}