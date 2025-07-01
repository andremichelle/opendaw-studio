import {TimeGrid} from "@/ui/timeline/TimeGrid.ts"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {Snapping} from "@/ui/timeline/Snapping.ts"

const SnapColor = "rgba(0, 0, 0, 0.20)"
const SubSnapColor = "rgba(0, 0, 0, 0.06)"

export const renderTimeGrid = (context: CanvasRenderingContext2D,
                               range: TimelineRange,
                               snapping: Snapping,
                               top: number,
                               bottom: number) => {
    TimeGrid.fragment([4, 4], range, ({pulse, ticks}) => {
        const x = Math.floor(range.unitToX(pulse) * devicePixelRatio)
        context.fillStyle = ticks % snapping.value === 0 ? SnapColor : SubSnapColor
        context.fillRect(x, top, devicePixelRatio, bottom - top)
    }, {minLength: 16})
}