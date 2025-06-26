import {RegionModifier} from "@/ui/timeline/tracks/audio-unit/regions/RegionModifier.ts"
import {Editing} from "box"
import {Arrays, int, isDefined, mod, Option} from "std"
import {ppqn, RegionCollection} from "dsp"
import {
    AnyLoopableRegionBoxAdapter,
    AnyRegionBoxAdapter,
    UnionAdapterTypes
} from "@core/shared/UnionAdapterTypes.ts"
import {Snapping} from "@/ui/timeline/Snapping.ts"
import {TrackBoxAdapter} from "@core/shared/adapters/timeline/TrackBoxAdapter.ts"
import {RegionClipResolver} from "@/ui/timeline/tracks/audio-unit/regions/RegionClipResolver.ts"
import {RegionModifyStrategy} from "@/ui/timeline/tracks/audio-unit/regions/RegionModifyStrategies.ts"
import {Dragging} from "dom"

class SelectedModifyStrategy implements RegionModifyStrategy {
    readonly #tool: RegionStartModifier

    constructor(tool: RegionStartModifier) {this.#tool = tool}

    readPosition(region: AnyRegionBoxAdapter): ppqn {return region.position + this.computeClampedDelta(region)}
    readComplete(region: AnyRegionBoxAdapter): ppqn {return region.complete}
    readLoopOffset(region: AnyLoopableRegionBoxAdapter): ppqn {
        return mod(region.loopOffset + this.computeClampedDelta(region), region.loopDuration)
    }
    readLoopDuration(region: AnyLoopableRegionBoxAdapter): ppqn {return region.loopDuration}
    readMirror(region: AnyRegionBoxAdapter): boolean {return region.isMirrowed}
    translateTrackIndex(value: int): int {return value}
    iterateRange<R extends AnyRegionBoxAdapter>(regions: RegionCollection<R>, from: ppqn, to: ppqn): Iterable<R> {
        return regions.iterateRange(from, this.#tool.adapters.reduce((to, adapter) => Math.max(to, adapter.complete), to))
    }

    computeClampedDelta(region: AnyLoopableRegionBoxAdapter): int {
        let position = (this.#tool.aligned ? this.#tool.reference.position : region.position) + this.#tool.deltaStart
        const limiter = region.trackBoxAdapter.unwrap().regions.collection
            .lowerEqual(region.position - 1, region => region.isSelected)
        if (isDefined(limiter) && position < limiter.complete) {position = limiter.complete}
        const min = Math.min(region.duration, this.#tool.snapping.value)
        return Math.max(region.duration - Math.max(min, region.complete - position), -region.position)
    }
}

type Construct = Readonly<{
    element: Element
    snapping: Snapping
    pointerPulse: ppqn
    reference: AnyRegionBoxAdapter
}>

export class RegionStartModifier implements RegionModifier {
    static create(selected: ReadonlyArray<AnyRegionBoxAdapter>, construct: Construct): Option<RegionStartModifier> {
        const adapters = selected.filter(region => UnionAdapterTypes.isLoopableRegion(region))
        return adapters.length === 0 ? Option.None : Option.wrap(new RegionStartModifier(construct, adapters))
    }

    readonly #element: Element
    readonly #snapping: Snapping
    readonly #pointerPulse: ppqn
    readonly #reference: AnyRegionBoxAdapter
    readonly #adapters: ReadonlyArray<AnyLoopableRegionBoxAdapter>
    readonly #selectedModifyStrategy: SelectedModifyStrategy

    #aligned: boolean
    #deltaStart: int

    private constructor({element, snapping, pointerPulse, reference}: Construct,
                        adapter: ReadonlyArray<AnyLoopableRegionBoxAdapter>) {
        this.#element = element
        this.#snapping = snapping
        this.#pointerPulse = pointerPulse
        this.#reference = reference
        this.#adapters = adapter
        this.#selectedModifyStrategy = new SelectedModifyStrategy(this)

        this.#aligned = false
        this.#deltaStart = 0
    }

    get aligned(): boolean {return this.#aligned}
    get deltaStart(): int {return this.#deltaStart}
    get snapping(): Snapping {return this.#snapping}
    get adapters(): ReadonlyArray<AnyLoopableRegionBoxAdapter> {return this.#adapters}
    get reference(): AnyRegionBoxAdapter {return this.#reference}

    showOrigin(): boolean {return false}
    selectedModifyStrategy(): RegionModifyStrategy {return this.#selectedModifyStrategy}
    unselectedModifyStrategy(): RegionModifyStrategy {return RegionModifyStrategy.Identity}

    update({clientX, ctrlKey}: Dragging.Event): void {
        const aligned = ctrlKey
        const deltaStart = this.#snapping.computeDelta(
            this.#pointerPulse, clientX - this.#element.getBoundingClientRect().left, this.#reference.position)
        let change = false
        if (this.#aligned !== aligned) {
            this.#aligned = aligned
            change = true
        }
        if (this.#deltaStart !== deltaStart) {
            this.#deltaStart = deltaStart
            change = true
        }
        if (change) {this.#dispatchChange()}
    }

    approve(editing: Editing): void {
        const modifiedTracks: ReadonlyArray<TrackBoxAdapter> = Arrays.removeDuplicates(this.#adapters
            .map(adapter => adapter.trackBoxAdapter.unwrap()))
        const solver = RegionClipResolver.fromSelection(modifiedTracks, this.#adapters, this, 0)
        const result = this.#adapters.map<{ region: AnyLoopableRegionBoxAdapter, delta: ppqn }>(region =>
            ({region, delta: this.#selectedModifyStrategy.computeClampedDelta(region)}))
        editing.modify(() => {
            result.forEach(({region, delta}) => {
                region.box.position.setValue(region.position + delta)
                region.box.duration.setValue(region.duration - delta)
                region.box.loopOffset.setValue(mod(region.loopOffset + delta, region.loopDuration))
            })
            solver()
        })
        RegionClipResolver.validateTracks(modifiedTracks)
    }

    cancel(): void {
        this.#aligned = false
        this.#deltaStart = 0
        this.#dispatchChange()
    }

    #dispatchChange(): void {
        this.#adapters.forEach(adapter => adapter.trackBoxAdapter.unwrap().regions.dispatchChange())
    }
}