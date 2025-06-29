import css from "./Column.sass?inline"
import {Html} from "opendaw-dom"
import {createElement, JsxValue} from "opendaw-jsx"

const className = Html.adoptStyleSheet(css, "Column")

type Construct = {
    ems: ReadonlyArray<number>
    space?: number,
    color?: string
}

export const Column = ({ems, space, color}: Construct, children: JsxValue) => (
    <div className={className}
         style={{
             display: "grid",
             gridTemplateRows: ems.map(em => em === 0 ? "auto" : `${em}em`).join(" "),
             rowGap: `${space ?? 0}em`,
             height: "100%",
             margin: "0 1px",
             alignContent: "center",
             justifyItems: "center",
             color: color ?? "inherit"
         }}>
        {children}
    </div>
)