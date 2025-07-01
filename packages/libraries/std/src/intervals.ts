export namespace Intervals {
    export const intersect1D = (min0: number, max0: number, min1: number, max1: number): boolean =>
        Math.max(min0, min1) <= Math.min(max0, max1)
}