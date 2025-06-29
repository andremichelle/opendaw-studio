import {RegionModifier} from "@/ui/timeline/tracks/audio-unit/regions/RegionModifier.ts"
import {Editing} from "opendaw-box"
import {Arrays, int, isDefined, Option} from "opendaw-std"
import {ppqn, RegionCollection} from "opendaw-dsp"
import {
    AnyLoopableRegionBoxAdapter,
    AnyRegionBoxAdapter,
    UnionAdapterTypes
} from "studio-shared"
import {Snapping} from "@/ui/timeline/Snapping.ts"
import {TrackBoxAdapter} from "studio-shared"
import {RegionClipResolver} from "@/ui/timeline/tracks/audio-unit/regions/RegionClipResolver.ts"
import {RegionModifyStrategy} from "@/ui/timeline/tracks/audio-unit/regions/RegionModifyStrategies.ts"
import {Dragging} from "opendaw-dom"

class SelectedModifyStrategy implements RegionModifyStrategy {
    readonly #tool: RegionDurationModifier

    constructor(tool: RegionDurationModifier) {this.#tool = tool}

    readPosition(region: AnyRegionBoxAdapter): ppqn {return region.position}
    readDuration(region: AnyRegionBoxAdapter): ppqn {return this.readComplete(region) - this.readPosition(region)}
    readComplete(region: AnyRegionBoxAdapter): ppqn {
        const duration = this.#tool.aligned
            ? (this.#tool.reference.position + this.#tool.reference.duration + this.#tool.deltaDuration) - region.position
            : region.duration + this.#tool.deltaDuration
        const complete = region.position + Math.max(Math.min(this.#tool.snapping.value, region.duration), duration)
        const limiter = region.trackBoxAdapter.unwrap().regions.collection
            .greaterEqual(region.complete, region => region.isSelected)
        if (isDefined(limiter) && complete > limiter.position) {return limiter.position}
        return complete
    }
    readLoopOffset(region: AnyLoopableRegionBoxAdapter): ppqn {return region.loopOffset}
    readLoopDuration(region: AnyLoopableRegionBoxAdapter): ppqn {return region.loopDuration}
    readMirror(region: AnyRegionBoxAdapter): boolean {return region.isMirrowed}
    translateTrackIndex(value: int): int {return value}
    iterateRange<R extends AnyRegionBoxAdapter>(regions: RegionCollection<R>, from: ppqn, to: ppqn): Iterable<R> {
        return regions.iterateRange(
            this.#tool.adapters.reduce((from, adapter) => Math.min(from, adapter.position), from), to)
    }
}

type Construct = Readonly<{
    element: Element
    snapping: Snapping
    pointerPulse: ppqn
    reference: AnyRegionBoxAdapter
}>

export class RegionDurationModifier implements RegionModifier {
    static create(selected: ReadonlyArray<AnyRegionBoxAdapter>, construct: Construct): Option<RegionDurationModifier> {
        const adapters = selected.filter(region => UnionAdapterTypes.isLoopableRegion(region))
        return adapters.length === 0 ? Option.None : Option.wrap(new RegionDurationModifier(construct, adapters))
    }

    readonly #element: Element
    readonly #snapping: Snapping
    readonly #pointerPulse: ppqn
    readonly #reference: AnyRegionBoxAdapter
    readonly #adapters: ReadonlyArray<AnyLoopableRegionBoxAdapter>
    readonly #selectedModifyStrategy: SelectedModifyStrategy

    #aligned: boolean
    #deltaDuration: int

    private constructor({element, snapping, pointerPulse, reference}: Construct,
                        adapter: ReadonlyArray<AnyLoopableRegionBoxAdapter>) {
        this.#element = element
        this.#snapping = snapping
        this.#pointerPulse = pointerPulse
        this.#reference = reference
        this.#adapters = adapter
        this.#selectedModifyStrategy = new SelectedModifyStrategy(this)

        this.#aligned = false
        this.#deltaDuration = 0
    }

    get snapping(): Snapping {return this.#snapping}
    get reference(): AnyRegionBoxAdapter {return this.#reference}
    get adapters(): ReadonlyArray<AnyLoopableRegionBoxAdapter> {return this.#adapters}
    get aligned(): boolean {return this.#aligned}
    get deltaDuration(): int {return this.#deltaDuration}

    showOrigin(): boolean {return false}
    selectedModifyStrategy(): RegionModifyStrategy {return this.#selectedModifyStrategy}
    unselectedModifyStrategy(): RegionModifyStrategy {return RegionModifyStrategy.Identity}

    update({clientX, ctrlKey}: Dragging.Event): void {
        const aligned = ctrlKey
        const deltaDuration = this.#snapping.computeDelta(
            this.#pointerPulse, clientX - this.#element.getBoundingClientRect().left, this.#reference.duration)
        let change = false
        if (this.#aligned !== aligned) {
            this.#aligned = aligned
            change = true
        }
        if (this.#deltaDuration !== deltaDuration) {
            this.#deltaDuration = deltaDuration
            change = true
        }
        if (change) {this.#dispatchChange()}
    }

    approve(editing: Editing): void {
        const modifiedTracks: ReadonlyArray<TrackBoxAdapter> =
            Arrays.removeDuplicates(this.#adapters.map(adapter => adapter.trackBoxAdapter.unwrap()))
        const solver = RegionClipResolver.fromSelection(modifiedTracks, this.#adapters, this, 0)
        const result = this.#adapters.map<{ region: AnyLoopableRegionBoxAdapter, duration: ppqn }>(region =>
            ({region, duration: this.#selectedModifyStrategy.readDuration(region)}))
        editing.modify(() => {
            result.forEach(({region, duration}) => region.box.duration.setValue(duration))
            solver()
        })
        RegionClipResolver.validateTracks(modifiedTracks)
    }

    cancel(): void {
        this.#aligned = false
        this.#deltaDuration = 0
        this.#dispatchChange()
    }

    #dispatchChange(): void {
        this.#adapters.forEach(adapter => adapter.trackBoxAdapter.unwrap().regions.dispatchChange())
    }
}