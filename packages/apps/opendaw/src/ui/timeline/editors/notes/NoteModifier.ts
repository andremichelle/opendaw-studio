import {NoteModifyStrategies} from "@/ui/timeline/editors/notes/NoteModifyStrategies.ts"
import {ObservableModifier} from "@/ui/timeline/ObservableModifier.ts"

export interface NoteModifier extends NoteModifyStrategies, ObservableModifier {}