export namespace Svg {
    export interface PathBuilder {
        moveTo(x: number, y: number): this
        lineTo(x: number, y: number): this
        quadratic(x1: number, y1: number, x: number, y: number): this
        quadraticTo(x: number, y: number): this
        cubic(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this
        arc(rx: number, ry: number, deg: number, largeArc: boolean, sweep: boolean, x: number, y: number): this
        circleSegment(cx: number, cy: number, radius: number, a0: number, a1: number): this
        close(): this
        get(): string
    }

    export const pathBuilder = (): PathBuilder => new class implements PathBuilder {
        #d: string = ""

        moveTo(x: number, y: number): this {
            this.#d += `M${x.toFixed(3)} ${y.toFixed(3)}`
            return this
        }

        lineTo(x: number, y: number): this {
            this.#d += `L${x.toFixed(3)} ${y.toFixed(3)}`
            return this
        }

        quadratic(x1: number, y1: number, x: number, y: number): this {
            this.#d += `Q${x1.toFixed(3)} ${y1.toFixed(3)} ${x.toFixed(3)} ${y.toFixed(3)}`
            return this
        }

        quadraticTo(x: number, y: number): this {
            this.#d += `T${x.toFixed(3)} ${y.toFixed(3)}`
            return this
        }

        cubic(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
            this.#d += `Q${
                x1.toFixed(3)} ${y1.toFixed(3)} ${x2.toFixed(3)} ${y2.toFixed(3)} ${x.toFixed(3)} ${y.toFixed(3)}`
            return this
        }

        arc(rx: number, ry: number, deg: number, largeArc: boolean, sweep: boolean, x: number, y: number): this {
            this.#d += `A${rx} ${ry} ${deg} ${largeArc ? 1 : 0} ${sweep ? 1 : 0} ${x.toFixed(3)} ${y.toFixed(3)}`
            return this
        }

        circleSegment(cx: number, cy: number, radius: number, a0: number, a1: number): this {
            const x0 = cx + Math.cos(a0) * radius
            const y0 = cy + Math.sin(a0) * radius
            const x1 = cx + Math.cos(a1) * radius
            const y1 = cy + Math.sin(a1) * radius
            let range = a1 - a0
            while (range < 0.0) range += Math.PI * 2.0
            return this.moveTo(x0, y0).arc(radius, radius, 0, range > Math.PI, true, x1, y1)
        }

        close(): this {
            this.#d += "Z"
            return this
        }

        get(): string {return this.#d}
    }
}
