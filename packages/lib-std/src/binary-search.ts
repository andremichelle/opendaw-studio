import {Comparator, Func, int} from "./lang"

// https://en.wikipedia.org/wiki/Binary_search_algorithm
//
export namespace BinarySearch {
    export const exact = <T>(sorted: ReadonlyArray<T>, key: T, comparator: Comparator<T>): int => {
        let l: int = 0 | 0
        let r: int = sorted.length - 1
        while (l <= r) {
            const m: int = (l + r) >>> 1
            const cmp = comparator(sorted[m], key)
            if (cmp === 0) {return m}
            if (cmp < 0) {l = m + 1} else {r = m - 1}
        }
        return -1
    }

    export const exactMapped = <T, U>(sorted: ReadonlyArray<U>, key: T, comparator: Comparator<T>, map: Func<U, T>): int => {
        let l: int = 0 | 0
        let r: int = sorted.length - 1
        while (l <= r) {
            const m: int = (l + r) >>> 1
            const cmp = comparator(map(sorted[m]), key)
            if (cmp === 0) {return m}
            if (cmp < 0) {l = m + 1} else {r = m - 1}
        }
        return -1
    }

    export const leftMost = <T>(sorted: ReadonlyArray<T>, key: T, comparator: Comparator<T>): int => {
        let l: int = 0 | 0
        let r: int = sorted.length
        while (l < r) {
            const m: int = (l + r) >>> 1
            if (comparator(sorted[m], key) < 0) {
                l = m + 1
            } else {
                r = m
            }
        }
        return l
    }

    export const rightMost = <T>(sorted: ReadonlyArray<T>, key: T, comparator: Comparator<T>): int => {
        let l: int = 0 | 0
        let r: int = sorted.length
        while (l < r) {
            const m: int = (l + r) >>> 1
            if (comparator(sorted[m], key) <= 0) {
                l = m + 1
            } else {
                r = m
            }
        }
        return r - 1
    }

    export const leftMostMapped =
        <T, U>(sorted: ReadonlyArray<U>, key: T, comparator: Comparator<T>, map: Func<U, T>): int => {
            let l: int = 0 | 0
            let r: int = sorted.length
            while (l < r) {
                const m: int = (l + r) >>> 1
                if (comparator(map(sorted[m]), key) < 0) {
                    l = m + 1
                } else {
                    r = m
                }
            }
            return l
        }

    export const rightMostMapped =
        <T, U>(sorted: ReadonlyArray<U>, key: T, comparator: Comparator<T>, map: Func<U, T>): int => {
            let l: int = 0 | 0
            let r: int = sorted.length
            while (l < r) {
                const m: int = (l + r) >>> 1
                if (comparator(map(sorted[m]), key) <= 0) {
                    l = m + 1
                } else {
                    r = m
                }
            }
            return r - 1
        }

    export const rangeMapped =
        <T, U>(sorted: ReadonlyArray<U>, key: T, comparator: Comparator<T>, map: Func<U, T>): [int, int] =>
            [leftMostMapped(sorted, key, comparator, map), rightMostMapped(sorted, key, comparator, map)]
}