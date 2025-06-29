import {TrackBoxAdapter} from "studio-shared"
import {Event, EventCollection, ppqn} from "opendaw-dsp"
import {RegionModifyStrategies} from "@/ui/timeline/tracks/audio-unit/regions/RegionModifyStrategies.ts"
import {AnyRegionBoxAdapter, UnionAdapterTypes} from "studio-shared"
import {asDefined, assert, Exec, int, mod, panic} from "opendaw-std"
import {RegionEditing} from "studio-shared"
import {TrackType} from "studio-shared"

export type ClipTask = {
    type: "delete"
    region: AnyRegionBoxAdapter
} | {
    type: "separate"
    region: AnyRegionBoxAdapter
    begin: ppqn
    end: ppqn
} | {
    type: "start"
    region: AnyRegionBoxAdapter
    position: ppqn
} | {
    type: "complete"
    region: AnyRegionBoxAdapter
    position: ppqn
}

interface Mask extends Event {complete: ppqn}

export class RegionClipResolver {
    static fromSelection(tracks: ReadonlyArray<TrackBoxAdapter>,
                         adapters: ReadonlyArray<AnyRegionBoxAdapter>,
                         strategy: RegionModifyStrategies,
                         deltaIndex: int = 0): Exec {
        const clipResolvers: Map<int, RegionClipResolver> =
            new Map(tracks.map(track => ([track.listIndex, new RegionClipResolver(strategy, track)])))
        adapters.forEach(adapter => {
            const index = adapter.trackBoxAdapter.unwrap().listIndex + deltaIndex
            asDefined(clipResolvers.get(index), `Cannot find clip resolver for index(${index})`)
                .addMask(adapter)
        })
        const tasks = Array.from(clipResolvers.values()).flatMap(resolver => resolver.#createSolver())
        return () => tasks.forEach(task => task())
    }

    static fromRange(track: TrackBoxAdapter, position: ppqn, complete: ppqn): Exec {
        // IdentityIncludeOrigin will include selected regions
        const clipResolver = new RegionClipResolver(RegionModifyStrategies.IdentityIncludeOrigin, track)
        clipResolver.addMaskRange(position, complete)
        return clipResolver.#createSolver()
    }

    static validateTracks(tracks: ReadonlyArray<TrackBoxAdapter>): void {
        for (const track of tracks) {this.validateTrack(track)}
    }

    static validateTrack(track: TrackBoxAdapter): void {
        const array = track.regions.collection.asArray()
        if (array.length === 0) {return}
        try {
            let prev = array[0]
            assert(prev.duration > 0, `duration(${prev.duration}) must be positive`)
            for (let i = 1; i < array.length; i++) {
                const next = array[i]
                assert(next.duration > 0, `duration(${next.duration}) must be positive`)
                if (prev.complete > next.position) {
                    return panic("Overlapping detected after clipping")
                }
                prev = next
            }
        } catch (error: any) {
            console.error(JSON.stringify({
                track: TrackType[track.type],
                regions: array.map(x => ({p: x.position, d: x.duration}))
            }))
            throw error
        }
    }

    readonly #strategy: RegionModifyStrategies
    readonly #ground: TrackBoxAdapter
    readonly #masks: Array<Mask>

    constructor(strategy: RegionModifyStrategies, ground: TrackBoxAdapter) {
        this.#strategy = strategy
        this.#ground = ground
        this.#masks = []
    }

    addMask(region: AnyRegionBoxAdapter): void {
        const strategy = this.#strategy.selectedModifyStrategy()
        this.addMaskRange(strategy.readPosition(region), strategy.readComplete(region))
    }

    addMaskRange(position: ppqn, complete: ppqn): void {
        this.#masks.push({type: "range", position, complete})
    }

    #createSolver(): Exec {
        const tasks = this.#createTasksFromMasks(this.#sortAndJoinMasks())
        return () => this.#executeTasks(tasks)
    }

    #sortAndJoinMasks(): ReadonlyArray<Mask> {
        const masks: Array<Mask> = []
        if (this.#masks.length === 0) {
            return panic("No clip-masks to solve")
        } else if (this.#masks.length === 1) {
            masks.push(this.#masks[0])
        } else {
            this.#masks.sort(EventCollection.DefaultComparator)
            let last: Mask = this.#masks.pop()!
            while (this.#masks.length > 0) {
                const prev = this.#masks.pop()!
                if (prev.complete > last.position) {
                    return panic("Masks are overlapping")
                } else if (prev.complete === last.position) {
                    last = {type: "range", position: prev.position, complete: last.complete}
                } else {
                    masks.push(last)
                    last = prev
                }
            }
            masks.push(last)
        }
        return masks
    }

    #createTasksFromMasks(masks: ReadonlyArray<Mask>): ReadonlyArray<ClipTask> {
        const tasks: Array<ClipTask> = []
        masks.forEach(({position, complete}) => {
            for (const region of this.#ground.regions.collection.iterateRange(position, complete)) {
                if (region.isSelected && !this.#strategy.showOrigin()) {
                    continue
                } else if (region.duration <= 0) {
                    return panic(`Invalid duration(${region.duration})`)
                } else if (region.complete <= position || region.position >= complete) {
                    return panic("Not overlapping")
                }
                const positionIn: boolean = region.position >= position
                const completeIn: boolean = region.complete <= complete
                if (positionIn && completeIn) {
                    tasks.push({type: "delete", region})
                } else if (!positionIn && !completeIn) {
                    tasks.push({type: "separate", region, begin: position, end: complete})
                } else if (completeIn) {
                    tasks.push({type: "complete", region, position})
                } else {
                    tasks.push({type: "start", region, position: complete})
                }
            }
        })
        return tasks
    }

    #executeTasks(tasks: ReadonlyArray<ClipTask>): void {
        tasks
            .toSorted(({type: a}, {type: b}) => {
                if (a === "delete" && b !== "delete") {return 1}
                if (b === "delete" && a !== "delete") {return -1}
                return 0
            })
            .forEach(task => {
                const {type, region} = task
                switch (type) {
                    case "delete":
                        // This is necessary to update the modified pointers while running the transaction.
                        // TODO I hope for a better solution that updates them automatically when information are to be read
                        region.box.graph.resolvePointers()
                        region.box.delete()
                        break
                    case "start":
                        if (UnionAdapterTypes.isLoopableRegion(region)) {
                            const delta = task.position - region.position
                            region.box.position.setValue(region.position + delta)
                            region.box.duration.setValue(region.duration - delta)
                            region.box.loopOffset.setValue(mod(region.loopOffset + delta, region.loopDuration))
                        } else {
                            return panic("Not yet implemented")
                        }
                        break
                    case "complete":
                        if (UnionAdapterTypes.isLoopableRegion(region)) {
                            region.box.duration.setValue(task.position - task.region.position)
                        } else {
                            return panic("Not yet implemented")
                        }
                        break
                    case "separate":
                        RegionEditing.clip(region, task.begin, task.end)
                        break
                }
            })
    }
}