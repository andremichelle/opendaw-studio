import {Box} from "lib-box"
import {MenuItem} from "@/ui/model/menu-item.ts"
import {showDebugBoxDialog} from "@/ui/components/dialogs.tsx"

export namespace DebugMenus {
    export const debugBox = (box: Box, separatorBefore: boolean = true) =>
        MenuItem.default({label: "Debug Box", separatorBefore}).setTriggerProcedure(() => showDebugBoxDialog(box))
}