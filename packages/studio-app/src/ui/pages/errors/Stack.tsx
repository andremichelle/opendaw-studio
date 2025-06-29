import css from "./Stack.sass?inline"
import {Html} from "lib-dom"
import {createElement} from "lib-jsx"

const className = Html.adoptStyleSheet(css, "Stack")

type Construct = {
    stack: string
}

export const Stack = ({stack}: Construct) => {
    return (
        <pre className={className}>{stack.length === 0 ? "No stack trace available." : stack}</pre>
    )
}
