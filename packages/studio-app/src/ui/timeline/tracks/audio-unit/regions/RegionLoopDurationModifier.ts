import {RegionModifier} from "@/ui/timeline/tracks/audio-unit/regions/RegionModifier.ts"
import {Editing} from "lib-box"
import {Arrays, int, Option} from "lib-std"
import {ppqn, RegionCollection} from "lib-dsp"
import {
    AnyLoopableRegionBoxAdapter,
    AnyRegionBoxAdapter,
    UnionAdapterTypes
} from "studio-shared"
import {Snapping} from "@/ui/timeline/Snapping.ts"
import {TrackBoxAdapter} from "studio-shared"
import {RegionClipResolver} from "@/ui/timeline/tracks/audio-unit/regions/RegionClipResolver.ts"
import {RegionModifyStrategy} from "@/ui/timeline/tracks/audio-unit/regions/RegionModifyStrategies.ts"
import {Dragging} from "lib-dom"

class SelectedModifyStrategy implements RegionModifyStrategy {
    readonly #tool: RegionLoopDurationModifier

    constructor(tool: RegionLoopDurationModifier) {this.#tool = tool}

    readPosition(region: AnyRegionBoxAdapter): ppqn {return region.position}
    readDuration(region: AnyLoopableRegionBoxAdapter): ppqn {return Math.max(region.duration, this.readLoopDuration(region) - region.loopOffset)}
    readComplete(region: AnyLoopableRegionBoxAdapter): ppqn {return region.position + this.readDuration(region)}
    readLoopOffset(region: AnyLoopableRegionBoxAdapter): ppqn {return region.loopOffset}
    readLoopDuration(region: AnyLoopableRegionBoxAdapter): ppqn {
        return Math.max(Math.min(this.#tool.snapping.value, region.loopDuration),
            region.loopDuration + this.#tool.deltaLoopDuration)
    }
    readMirror(region: AnyRegionBoxAdapter): boolean {return region.isMirrowed}
    translateTrackIndex(value: int): int {return value}
    iterateRange<R extends AnyRegionBoxAdapter>(regions: RegionCollection<R>, from: ppqn, to: ppqn): Iterable<R> {
        return regions.iterateRange(from, to)
    }
}

type Construct = Readonly<{
    element: Element
    snapping: Snapping
    pointerPulse: ppqn
    reference: AnyRegionBoxAdapter
    resize: boolean
}>

type BeforeState = { region: AnyLoopableRegionBoxAdapter, duration: ppqn, loopDuration: ppqn }

export class RegionLoopDurationModifier implements RegionModifier {
    static create(selected: ReadonlyArray<AnyRegionBoxAdapter>, construct: Construct): Option<RegionLoopDurationModifier> {
        const adapters = selected.filter(region => UnionAdapterTypes.isLoopableRegion(region))
        return adapters.length === 0 ? Option.None : Option.wrap(new RegionLoopDurationModifier(construct, adapters))
    }

    readonly #element: Element
    readonly #snapping: Snapping
    readonly #pointerPulse: ppqn
    readonly #reference: AnyRegionBoxAdapter
    readonly #resize: boolean
    readonly #adapters: ReadonlyArray<AnyLoopableRegionBoxAdapter>
    readonly #selectedModifyStrategy: SelectedModifyStrategy

    #deltaLoopDuration: int

    private constructor({element, snapping, pointerPulse, reference, resize}: Construct,
                        adapter: ReadonlyArray<AnyLoopableRegionBoxAdapter>) {
        this.#element = element
        this.#snapping = snapping
        this.#pointerPulse = pointerPulse
        this.#reference = reference
        this.#resize = resize
        this.#adapters = adapter
        this.#selectedModifyStrategy = new SelectedModifyStrategy(this)

        this.#deltaLoopDuration = 0
    }

    get snapping(): Snapping {return this.#snapping}
    get deltaLoopDuration(): int {return this.#deltaLoopDuration}

    showOrigin(): boolean {return false}
    selectedModifyStrategy(): RegionModifyStrategy {return this.#selectedModifyStrategy}
    unselectedModifyStrategy(): RegionModifyStrategy {return RegionModifyStrategy.Identity}

    update({clientX}: Dragging.Event): void {
        const {position, complete, loopOffset, loopDuration} = this.#reference
        const d = this.#resize ? complete - (position + loopDuration - loopOffset) : 0
        const clientRect = this.#element.getBoundingClientRect()
        const deltaDuration = this.#snapping.computeDelta(
            this.#pointerPulse - d, clientX - clientRect.left, loopDuration)
        let change = false
        if (this.#deltaLoopDuration !== deltaDuration) {
            this.#deltaLoopDuration = deltaDuration
            change = true
        }
        if (change) {this.#dispatchChange()}
    }

    approve(editing: Editing): void {
        const modifiedTracks: ReadonlyArray<TrackBoxAdapter> =
            Arrays.removeDuplicates(this.#adapters.map(adapter => adapter.trackBoxAdapter.unwrap()))
        const solver = RegionClipResolver.fromSelection(modifiedTracks, this.#adapters, this, 0)
        const result = this.#adapters.map<BeforeState>(region =>
            ({
                region,
                duration: this.#selectedModifyStrategy.readDuration(region),
                loopDuration: this.#selectedModifyStrategy.readLoopDuration(region)
            }))
        editing.modify(() => {
            result.forEach(({region, duration, loopDuration}) => {
                region.box.duration.setValue(duration)
                region.box.loopDuration.setValue(loopDuration)
            })
            solver()
        })
        RegionClipResolver.validateTracks(modifiedTracks)
    }

    cancel(): void {
        this.#deltaLoopDuration = 0
        this.#dispatchChange()
    }

    #dispatchChange(): void {
        this.#adapters.forEach(adapter => adapter.trackBoxAdapter.unwrap().regions.dispatchChange())
    }
}