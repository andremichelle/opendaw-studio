import {ppqn, Region, RegionCollection} from "opendaw-dsp"
import {int} from "opendaw-std"
import {AnyLoopableRegionBoxAdapter, AnyRegionBoxAdapter} from "studio-shared"

export interface RegionModifyStrategies {
    showOrigin(): boolean
    selectedModifyStrategy(): RegionModifyStrategy
    unselectedModifyStrategy(): RegionModifyStrategy
}

export namespace RegionModifyStrategies {
    export const Identity: RegionModifyStrategies = Object.freeze({
        showOrigin: (): boolean => false,
        selectedModifyStrategy: (): RegionModifyStrategy => RegionModifyStrategy.Identity,
        unselectedModifyStrategy: (): RegionModifyStrategy => RegionModifyStrategy.Identity
    })
    export const IdentityIncludeOrigin: RegionModifyStrategies = Object.freeze({
        showOrigin: (): boolean => true,
        selectedModifyStrategy: (): RegionModifyStrategy => RegionModifyStrategy.Identity,
        unselectedModifyStrategy: (): RegionModifyStrategy => RegionModifyStrategy.Identity
    })
}

export interface RegionModifyStrategy {
    readPosition(region: AnyRegionBoxAdapter): ppqn
    readComplete(region: AnyRegionBoxAdapter): ppqn
    readLoopOffset(region: AnyRegionBoxAdapter): ppqn
    readLoopDuration(region: AnyRegionBoxAdapter): ppqn
    readMirror(region: AnyRegionBoxAdapter): boolean
    translateTrackIndex(value: int): int
    iterateRange<R extends AnyRegionBoxAdapter>(regions: RegionCollection<R>, from: ppqn, to: ppqn): Iterable<R>
}

export namespace RegionModifyStrategy {
    export const Identity: RegionModifyStrategy = Object.freeze({
        readPosition: (region: AnyRegionBoxAdapter): ppqn => region.position,
        readComplete: (region: AnyRegionBoxAdapter): ppqn => region.complete,
        readLoopOffset: (region: AnyLoopableRegionBoxAdapter): ppqn => region.loopOffset,
        readLoopDuration: (region: AnyLoopableRegionBoxAdapter): ppqn => region.loopDuration,
        readMirror: (region: AnyRegionBoxAdapter): boolean => region.isMirrowed,
        translateTrackIndex: (value: int): int => value,
        iterateRange: <R extends Region>(regions: RegionCollection<R>,
                                         from: ppqn, to: ppqn): Iterable<R> => regions.iterateRange(from, to)
    })
}