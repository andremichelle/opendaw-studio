import {createElement} from "opendaw-jsx"

export const FlexSpacer = ({pixels}: { pixels?: number }) => (
    <div style={{display: "flex", flex: pixels === undefined ? "1 0 auto" : `0 0 ${pixels}px`}}/>
)