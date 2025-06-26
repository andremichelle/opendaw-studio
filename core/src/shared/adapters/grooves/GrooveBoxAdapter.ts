import {BoxAdapter} from "@core/shared/BoxAdapter.ts"
import {AssertType} from "std"

export interface GrooveAdapter extends BoxAdapter {
    type: "groove-adapter"
}

export namespace GrooveAdapter {
    export const checkType: AssertType<GrooveAdapter> = (adapter: unknown): adapter is GrooveAdapter =>
        adapter !== null && typeof adapter === "object" && "type" in adapter && adapter.type === "groove-adapter"
}