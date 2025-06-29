import {int} from "opendaw-std"

const ellipsis = "…"

export namespace Context2d {
    export const truncateText = (context: CanvasRenderingContext2D, text: string, maxWidth: number): {
        text: string,
        width: number
    } => {
        if (text.length === 0) {return {text: "", width: 0}}
        let width: number = context.measureText(text).width
        if (width <= maxWidth) {return {text, width}}
        const ellipseWidth = context.measureText(ellipsis).width
        let l: int = 0 | 0
        let r: int = text.length | 0
        while (l < r) {
            const mid: number = (r + l) >>> 1
            width = context.measureText(text.substring(0, mid + 1)).width + ellipseWidth
            if (width <= maxWidth) {
                l = mid + 1
            } else {
                r = mid
            }
        }
        if (l === 0) {return {text: "", width: 0}}
        const result = text.substring(0, l)
        return {text: result + ellipsis, width: context.measureText(result).width + ellipseWidth}
    }
}