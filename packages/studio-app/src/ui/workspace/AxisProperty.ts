import {Workspace} from "@/ui/workspace/Workspace.ts"

export const AxisProperty = {
    horizontal: {pointer: "clientX", size: "clientWidth", minStyle: "minWidth", maxStyle: "maxWidth"},
    vertical: {pointer: "clientY", size: "clientHeight", minStyle: "minHeight", maxStyle: "maxHeight"}
} as const satisfies Record<Workspace.Orientation,
    Record<string, keyof Element | keyof MouseEvent | keyof CSSStyleDeclaration>>