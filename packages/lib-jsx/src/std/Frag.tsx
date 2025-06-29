import {JsxValue} from "../types"

// will not generate its own element, similar to React's empty tags </>
export const Frag = (_: unknown, children: ReadonlyArray<JsxValue>) => children