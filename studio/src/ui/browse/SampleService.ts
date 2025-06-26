import {AudioSample} from "@/audio/AudioSample"
import {HTMLSelection} from "@/ui/HTMLSelection"
import {asDefined, DefaultObservableValue, UUID} from "std"
import {StudioService} from "@/service/StudioService"
import {AudioFileBox, AudioRegionBox} from "@core/data/boxes"
import {Modifier} from "../Modifier"
import {AudioUnitType} from "@core/data/enums"
import {Instruments} from "@/service/Instruments"
import {PPQN} from "dsp"
import {ColorCodes} from "../mixer/ColorCodes"
import {IconSymbol} from "@/IconSymbol"
import {showApproveDialog, showInfoDialog, showProcessDialog} from "../components/dialogs"
import {AudioStorage} from "@/audio/AudioStorage"
import {Projects} from "@/project/Projects"
import {SampleApi} from "@/service/SampleApi"
import {Promises} from "runtime"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter"

export class SampleService {
    readonly #service: StudioService
    readonly #selection: HTMLSelection

    constructor(service: StudioService, selection: HTMLSelection) {
        this.#service = service
        this.#selection = selection
    }

    requestTapes(): void {
        if (!this.#service.hasProjectSession) {return}
        const project = this.#service.project
        const {editing, boxGraph, boxAdapters, rootBoxAdapter} = project
        editing.modify(() => {
            const samples = this.#samples()
            const startIndex = Modifier.pushAudioUnitsIndices(rootBoxAdapter, AudioUnitType.Instrument, samples.length)
            samples.forEach(({uuid: uuidAsString, name, bpm, duration: durationInSeconds}, index) => {
                const uuid = UUID.parse(uuidAsString)
                const audioUnitBox = Modifier.createAudioUnit(project, AudioUnitType.Instrument, startIndex + index)
                const audioUnitBoxAdapter = boxAdapters.adapterFor(audioUnitBox, AudioUnitBoxAdapter)
                const audioFileBox = boxGraph.findBox<AudioFileBox>(uuid)
                    .unwrapOrElse(() => AudioFileBox.create(boxGraph, uuid, box => {
                        box.fileName.setValue(name)
                        box.startInSeconds.setValue(0)
                        box.endInSeconds.setValue(durationInSeconds)
                    }))
                const tape = Instruments.Tape
                tape.createDevice(boxGraph, audioUnitBoxAdapter, name, IconSymbol.Tape)
                const trackBox = tape.createTrack(boxGraph, audioUnitBoxAdapter)
                const duration = Math.round(PPQN.secondsToPulses(durationInSeconds, bpm))
                AudioRegionBox.create(boxGraph, UUID.generate(), box => {
                    box.position.setValue(0)
                    box.duration.setValue(duration)
                    box.loopDuration.setValue(duration)
                    box.regions.refer(trackBox.regions)
                    box.hue.setValue(ColorCodes.forTrackType(trackBox.type.getValue()))
                    box.label.setValue(name)
                    box.file.refer(audioFileBox)
                })
            })
        })
    }

    async deleteSelected() {return this.deleteSamples(...this.#samples())}

    async deleteSamples(...samples: ReadonlyArray<AudioSample>) {
        const processDialog = showProcessDialog("Checking Sample Usages", new DefaultObservableValue(0.5))
        const used = await Projects.listUsedSamples()
        const online = new Set<string>((await SampleApi.all()).map(({uuid}) => uuid))
        processDialog.close()
        const {status} = await Promises.tryCatch(showApproveDialog({
            headline: "Remove Sample(s)?",
            message: "This cannot be undone!",
            approveText: "Remove"
        }))
        if (status === "rejected") {return}
        for (const {uuid, name} of samples) {
            const isUsed = used.has(uuid)
            const isOnline = online.has(uuid)
            if (isUsed && !isOnline) {
                await showInfoDialog({headline: "Cannot Delete Sample", message: `${name} is used by a project.`})
            } else {
                await AudioStorage.remove(UUID.parse(uuid))
            }
        }
    }

    #samples(): ReadonlyArray<AudioSample> {
        const selected = this.#selection.getSelected()
        return selected.map(element => JSON.parse(asDefined(element.getAttribute("data-selection"))) as AudioSample)
    }
}