import {Func} from "./lang"

export class Maps {
    static createIfAbsent<K, V>(map: Map<K, V>, key: K, factory: Func<K, V>): V {
        let value = map.get(key)
        if (value === undefined) {
            value = factory(key)
            map.set(key, value)
        }
        return value
    }
}

export class WeakMaps {
    static createIfAbsent<K extends object, V>(map: WeakMap<K, V>, key: K, factory: Func<K, V>): V {
        let value = map.get(key)
        if (value === undefined) {
            value = factory(key)
            map.set(key, value)
        }
        return value
    }
}