import {AutomatableParameter} from "@core/worklet/AutomatableParameter.ts"

export type AutomatableParameters = {
    sampleStart: AutomatableParameter<number>
    sampleEnd: AutomatableParameter<number>
    attack: AutomatableParameter<number>
    release: AutomatableParameter<number>
    pitch: AutomatableParameter<number>
}