import {isDefined, Lifecycle, Parameter, PI_HALF, TAU, unitValue} from "lib-std"
import {createElement} from "lib-jsx"
import css from "./Knob.sass?inline"
import {Html, Svg} from "lib-dom"

const className = Html.adoptStyleSheet(css, "knob")

export const DefaultDesign: Readonly<Design> = Object.freeze({
    radius: 20,
    trackWidth: 1.5,
    angleOffset: Math.PI / 5.0,
    indicator: [0.3, 0.6],
    indicatorWidth: 2.5
} satisfies Design)

export const TinyDesign: Readonly<Design> = Object.freeze({
    radius: 20,
    trackWidth: 1.5,
    angleOffset: Math.PI / 5.0,
    indicator: [0.2, 0.66],
    indicatorWidth: 2.5
} satisfies Design)

type Design = {
    readonly radius: number // defines the size
    readonly trackWidth: number // thickness of the arc
    readonly angleOffset: number // positive & smaller than PI/2
    readonly indicator: [unitValue, unitValue] // allows floating indicator
    readonly indicatorWidth: number
}

type Construct = {
    lifecycle: Lifecycle
    value: Parameter
    anchor: unitValue
    color?: string
    design?: Design
}

export const Knob = ({lifecycle, value, anchor, color, design}: Construct) => {
    const {radius, trackWidth, angleOffset, indicator: [min, max], indicatorWidth} = design ?? DefaultDesign

    const trackRadius = Math.floor(radius - trackWidth * 0.5)
    const angleMin = PI_HALF + angleOffset
    const angleMax = PI_HALF - angleOffset
    const angleRange = (TAU - angleOffset * 2.0)
    const angleAnc = angleMin + anchor * angleRange
    const width = radius * 2.0
    const height = radius + Math.ceil(Math.cos(angleOffset) * radius)
    const paths = [
        <path d=""/>,
        <path d="" stroke-linecap="round" stroke-width={indicatorWidth} stroke="rgba(0,0,0,0.5)"/>
    ]
    const update = (unitValue: unitValue) => {
        const angleVal = angleMin + unitValue * angleRange
        const aMinValAnc = Math.min(angleVal, angleAnc)
        const aMaxValAnc = Math.max(angleVal, angleAnc)
        const [value, line] = paths
        value.setAttribute("d", Svg.pathBuilder()
            .circleSegment(0, 0, trackRadius, aMinValAnc - 1.0 / trackRadius, aMaxValAnc + 1.0 / trackRadius)
            .get())
        const cos = Math.cos(angleVal) * trackRadius
        const sin = Math.sin(angleVal) * trackRadius
        line.setAttribute("d", Svg.pathBuilder()
            .moveTo(cos * min, sin * min)
            .lineTo(cos * max, sin * max)
            .get())
    }
    const svg: SVGSVGElement = (
        <svg viewBox={`0 0 ${width} ${height}`} classList={className}>
            <g fill="none"
               stroke="currentColor"
               stroke-linecap="butt"
               stroke-width={trackWidth}
               transform={`translate(${radius}, ${radius})`}>
                <circle r={radius * max} stroke="none" fill="currentColor" classList="light"/>
                <circle r={radius * max} stroke="none" fill="currentColor"/>
                <path stroke="currentColor" stroke-opacity={1 / 3}
                      d={Svg.pathBuilder()
                          .circleSegment(0, 0, trackRadius, angleMin, angleMax)
                          .get()}/>
                {paths}
            </g>
        </svg>
    )
    if (isDefined(color)) {
        svg.style.color = color
    }
    lifecycle.own(value.subscribe(model => update(model.getControlledUnitValue())))
    update(value.getControlledUnitValue())
    return svg
}