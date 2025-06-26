import {
    AudioClipBox,
    AudioRegionBox,
    BoxVisitor,
    NoteClipBox,
    NoteRegionBox,
    ValueClipBox,
    ValueRegionBox
} from "./boxes"
import {Box} from "box"

export type AnyClipBox = NoteClipBox | ValueClipBox | AudioClipBox
export type AnyRegionBox = AudioRegionBox | NoteRegionBox | ValueRegionBox
export type AnyLoopableRegionBox = AnyRegionBox // TODO Clarify

export const UnionBoxTypes = {
    isClipBox: (box: Box): box is AnyClipBox => box.accept<BoxVisitor<boolean>>({
        visitNoteClipBox: (_box: NoteClipBox): boolean => true,
        visitAudioClipBox: (_box: AudioClipBox): boolean => true,
        visitValueClipBox: (_box: ValueClipBox): boolean => true
    }) ?? false,
    isRegionBox: (box: Box): box is AnyRegionBox => box.accept<BoxVisitor<boolean>>({
        visitNoteRegionBox: (_box: NoteRegionBox): boolean => true,
        visitAudioRegionBox: (_box: AudioRegionBox): boolean => true,
        visitValueRegionBox: (_box: ValueRegionBox): boolean => true
    }) ?? false,
    isLoopableRegionBox: (box: Box): box is AnyLoopableRegionBox => box.accept<BoxVisitor<boolean>>({
        visitNoteRegionBox: (_box: NoteRegionBox): boolean => true,
        visitAudioRegionBox: (_box: AudioRegionBox): boolean => true,
        visitValueRegionBox: (_box: ValueRegionBox): boolean => true
    }) ?? false
}