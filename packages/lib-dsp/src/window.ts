export namespace Window {
    export enum Type {Bartlett, Blackman, BlackmanHarris, Hamming, Hanning}

    export const create = (type: Type, n: number): Float32Array => {
        const values = new Float32Array(n)
        const a = Math.PI / (n - 1)
        switch (type) {
            case Type.Bartlett: {
                const n2 = (n >> 1) - 1
                let i = 0
                for (; i <= n2; ++i) {
                    values[i] = 2.0 * i / (n - 1.0)
                }
                for (; i < n; ++i) {
                    values[i] = 2.0 - 2.0 * i / (n - 1.0)
                }
                return values
            }
            case Type.Blackman: {
                const c = 2.0 * a
                const d = 4.0 * a
                for (let i = 0; i < n; ++i) {
                    values[i] = 0.42323 - 0.49755 * Math.cos(c * i) + 0.07922 * Math.cos(d * i)
                }
                return values
            }
            case Type.BlackmanHarris: {
                const c = 2.0 * a
                const d = 4.0 * a
                const e = 6.0 * a
                for (let i = 0; i < n; ++i) {
                    values[i] = 0.35875 - 0.48829 * Math.cos(c * i) + 0.14128 * Math.cos(d * i) - 0.01168 * Math.cos(e * i)
                }
                return values
            }
            case Type.Hamming: {
                const c = 2.0 * a
                for (let i = 0; i < n; ++i) {
                    values[i] = 0.54 - 0.46 * Math.cos(c * i)
                }
                return values
            }
            case Type.Hanning: {
                const c = 2.0 * a
                for (let i = 0; i < n; ++i) {
                    values[i] = 0.5 - 0.5 * Math.cos(c * i)
                }
                return values
            }
        }
    }
}