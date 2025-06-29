import {ValueModifyStrategy} from "@/ui/timeline/editors/value/ValueModifyStrategies.ts"
import {ObservableModifier} from "@/ui/timeline/ObservableModifier.ts"

export interface ValueModifier extends ValueModifyStrategy, ObservableModifier {}