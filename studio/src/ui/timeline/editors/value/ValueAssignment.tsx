import {DeviceBoxAdapter} from "@core/shared/devices.ts"
import {AutomatableParameterFieldAdapter} from "@core/shared/AutomatableParameterFieldAdapter.ts"

export type ValueAssignment = {
    device?: DeviceBoxAdapter
    adapter: AutomatableParameterFieldAdapter
}