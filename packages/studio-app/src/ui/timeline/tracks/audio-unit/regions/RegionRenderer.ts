import {int, Option, quantizeFloor, unitValue} from "lib-std"
import {LoopableRegion, PPQN, ValueEvent} from "lib-dsp"
import {AudioRegionBoxAdapter} from "studio-adapters"
import {NoteRegionBoxAdapter} from "studio-adapters"
import {
    RegionModifyStrategies,
    RegionModifyStrategy
} from "@/ui/timeline/tracks/audio-unit/regions/RegionModifyStrategies.ts"
import {TracksManager} from "@/ui/timeline/tracks/audio-unit/TracksManager.ts"
import {ValueRegionBoxAdapter} from "studio-adapters"
import {renderNotes} from "@/ui/timeline/renderer/notes.ts"
import {RegionBound, RegionColors} from "@/ui/timeline/renderer/env.ts"
import {renderAudio} from "@/ui/timeline/renderer/audio.ts"
import {renderValueStream} from "@/ui/timeline/renderer/value.ts"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {Context2d} from "lib-dom"

export const renderRegions = (context: CanvasRenderingContext2D,
                              tracks: TracksManager,
                              range: TimelineRange,
                              index: int): void => {
    const canvas = context.canvas
    const {width, height} = canvas
    const {fontFamily} = getComputedStyle(canvas)

    // subtract one pixel to avoid making special cases for a possible outline
    const unitMin = range.unitMin - range.unitPadding - range.unitsPerPixel
    const unitMax = range.unitMax
    const unitsPerPixel = range.unitsPerPixel

    const em = 9 * devicePixelRatio
    const labelHeight = Math.ceil(em * 1.5)
    const bound: RegionBound = {top: labelHeight + 1.0, bottom: height - 2.5}

    context.clearRect(0, 0, width, height)
    context.textBaseline = "middle"
    context.font = `${em}px ${fontFamily}`

    const grid = false
    if (grid) {
        context.fillStyle = "rgba(255, 255, 255, 0.01)"
        for (let p = quantizeFloor(unitMin, PPQN.Bar); p < unitMax; p += PPQN.Bar) {
            const x0 = Math.floor(range.unitToX(p) * devicePixelRatio)
            const x1 = Math.floor(range.unitToX(p + PPQN.Bar) * devicePixelRatio) - devicePixelRatio
            context.fillRect(x0, 0, x1 - x0, height)
        }
    }
    const renderRegions = (strategy: RegionModifyStrategy, filterSelected: boolean, hideSelected: boolean): void => {
        const optTrack = tracks.getByIndex(strategy.translateTrackIndex(index))
        if (optTrack.isEmpty()) {return}
        const trackBoxAdapter = optTrack.unwrap().trackBoxAdapter
        const regions = strategy.iterateRange(trackBoxAdapter.regions.collection, unitMin, unitMax)
        const dpr = devicePixelRatio

        for (const region of regions) {
            if (region.isSelected ? hideSelected : !filterSelected) {continue}

            const position = strategy.readPosition(region)
            const complete = strategy.readComplete(region) - unitsPerPixel

            const x0Int = Math.floor(range.unitToX(Math.max(position, unitMin)) * dpr)
            const x1Int = Math.max(Math.floor(range.unitToX(Math.min(complete, unitMax)) * dpr), x0Int + dpr)
            const xnInt = x1Int - x0Int

            const selected = region.isSelected && !filterSelected

            context.clearRect(x0Int, 0, xnInt, height)

            const hue = region.hue
            const saturationFactor = region.mute ? 0.05 : 1.0
            const fullSat = 100 * saturationFactor
            const normSat = 60 * saturationFactor
            const lessSat = 45 * saturationFactor
            const labelColor = selected ? `hsl(${hue}, ${normSat}%, 10%)` : `hsl(${hue}, ${normSat}%, 60%)`
            const contentColor = `hsl(${hue}, ${normSat}%, 45%)`
            const contentLoopColor = `hsl(${hue}, ${lessSat}%, 30%)`
            const loopColor = `hsla(${hue}, 40%, ${normSat}%, 0.15)`
            const backgroundColor = selected ? `hsla(${hue}, ${normSat}%, 60%, 0.06)` : `hsla(${hue}, ${normSat}%, 60%, 0.03)`
            const labelBackgroundColor = selected ? `hsla(${hue}, ${fullSat}%, 60%, 0.75)` : `hsla(${hue}, ${lessSat}%, 60%, 0.15)`
            const colors: RegionColors = {contentColor, contentLoopColor}

            context.fillStyle = labelBackgroundColor
            context.fillRect(x0Int, 0, xnInt, labelHeight)

            context.fillStyle = backgroundColor
            context.fillRect(x0Int, labelHeight, xnInt, height - labelHeight)

            const maxTextWidth = xnInt - 4 // subtract text-padding
            context.fillStyle = labelColor

            if (strategy.readMirror(region)) {
                context.font = `italic ${em}px ${fontFamily}`
            } else {
                context.font = `${em}px ${fontFamily}`
            }
            const text = region.label.length === 0 ? "◻" : region.label
            context.fillText(Context2d.truncateText(context, text, maxTextWidth).text, x0Int + 1, 1 + labelHeight / 2)
            if (!region.hasCollection) {
                continue
            }
            context.fillStyle = contentColor
            region.accept({
                visitNoteRegionBoxAdapter: (region: NoteRegionBoxAdapter): void => {
                    for (const pass of LoopableRegion.locateLoops({
                        position,
                        complete,
                        loopOffset: strategy.readLoopOffset(region),
                        loopDuration: strategy.readLoopDuration(region)
                    }, unitMin, unitMax)) {
                        if (pass.index > 0) {
                            const x = Math.floor(range.unitToX(pass.resultStart) * dpr)
                            context.fillStyle = loopColor
                            context.fillRect(x, labelHeight, 1, height - labelHeight)
                        }
                        renderNotes(context, range, region, bound, colors, pass)
                    }
                },
                visitAudioRegionBoxAdapter: (region: AudioRegionBoxAdapter): void => {
                    for (const pass of LoopableRegion.locateLoops({
                        position,
                        complete,
                        loopOffset: strategy.readLoopOffset(region),
                        loopDuration: strategy.readLoopDuration(region)
                    }, unitMin, unitMax)) {
                        if (pass.index > 0) {
                            const x = Math.floor(range.unitToX(pass.resultStart) * dpr)
                            context.fillStyle = loopColor
                            context.fillRect(x, labelHeight, 1, height - labelHeight)
                        }
                        renderAudio(context, range, region.file, region.gain, bound, colors, pass)
                    }
                },
                visitValueRegionBoxAdapter: (region: ValueRegionBoxAdapter) => {
                    const padding = dpr
                    const top = labelHeight + padding
                    const bottom = height - padding
                    context.save()
                    context.beginPath()
                    context.rect(x0Int + padding, top, x1Int - x0Int - padding, bottom - top + padding)
                    context.clip()
                    const valueToY = (value: unitValue): number => bottom + value * (top - bottom)
                    const events = region.events.unwrap()
                    for (const pass of LoopableRegion.locateLoops({
                        position: position,
                        complete: complete,
                        loopOffset: strategy.readLoopOffset(region),
                        loopDuration: strategy.readLoopDuration(region)
                    }, unitMin, unitMax)) {
                        if (pass.index > 0) {
                            const x = Math.floor(range.unitToX(pass.resultStart) * dpr)
                            context.fillStyle = loopColor
                            context.fillRect(x, labelHeight, 1, height - labelHeight)
                        }
                        const windowMin = pass.resultStart - pass.rawStart
                        const windowMax = pass.resultEnd - pass.rawStart
                        context.strokeStyle = contentColor
                        context.beginPath()
                        renderValueStream(context, range, ValueEvent.iterateWindow(events, windowMin, windowMax), valueToY, colors, 0.2, 0.0, pass)
                        context.stroke()
                    }
                    context.restore()
                }
            })

            if (tracks.service.project.userEditingManager.timeline.isEditing(region.box)) {
                context.strokeStyle = `hsla(${hue}, ${normSat}%, 45%, 0.1)`
                context.beginPath()
                context.rect(x0Int + dpr, dpr, xnInt - 2 * dpr, height - 2 * dpr)
                context.stroke()
            }
        }
    }

    const modifier: Option<RegionModifyStrategies> = tracks.currentRegionModifier
    const strategy = modifier.unwrapOrElse(RegionModifyStrategies.Identity)

    renderRegions(strategy.unselectedModifyStrategy(), true, !strategy.showOrigin())
    renderRegions(strategy.selectedModifyStrategy(), false, false)
}