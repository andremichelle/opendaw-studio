import {AudioBusBox, AudioUnitBox, RootBox, TimelineBox, UserInterfaceBox} from "studio-boxes"

export type MandatoryBoxes = {
    rootBox: RootBox
    timelineBox: TimelineBox
    masterBusBox: AudioBusBox
    masterAudioUnit: AudioUnitBox
    userInterfaceBox: UserInterfaceBox
}