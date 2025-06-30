import {AudioUnitType} from "studio-enums"
import {Colors} from "../Colors"
import {TrackType} from "studio-adapters"

export namespace ColorCodes {
    export const forAudioType = (type?: AudioUnitType): string => {
        switch (type) {
            case AudioUnitType.Output:
                return Colors.blue
            case AudioUnitType.Aux:
                return Colors.purple
            case AudioUnitType.Bus:
                return Colors.orange
            case AudioUnitType.Instrument:
                return Colors.green
            default:
                return Colors.dark
        }
    }

    export const forTrackType = (type?: TrackType): number => {
        switch (type) {
            case TrackType.Audio:
                return 200
            case TrackType.Notes:
                return 45
            case TrackType.Value:
                return 156
            default:
                return 0
        }
    }
}