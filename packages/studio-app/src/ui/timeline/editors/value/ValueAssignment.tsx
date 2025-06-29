import {DeviceBoxAdapter} from "studio-shared"
import {AutomatableParameterFieldAdapter} from "studio-shared"

export type ValueAssignment = {
    device?: DeviceBoxAdapter
    adapter: AutomatableParameterFieldAdapter
}