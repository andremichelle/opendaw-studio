import {Modifier} from "@/ui/timeline/Modifier.ts"
import {ClipModifyStrategies} from "@/ui/timeline/tracks/audio-unit/clips/ClipModifyStrategy.ts"

export interface ClipModifier extends Modifier, ClipModifyStrategies {}