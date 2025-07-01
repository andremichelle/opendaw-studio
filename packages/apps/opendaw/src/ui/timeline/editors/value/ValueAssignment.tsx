import {DeviceBoxAdapter} from "studio-adapters"
import {AutomatableParameterFieldAdapter} from "studio-adapters"

export type ValueAssignment = {
    device?: DeviceBoxAdapter
    adapter: AutomatableParameterFieldAdapter
}