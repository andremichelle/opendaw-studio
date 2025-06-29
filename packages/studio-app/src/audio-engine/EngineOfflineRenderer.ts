import {EngineWorklet} from "@/audio-engine/EngineWorklet.ts"
import {Project} from "@/project/Project.ts"
import {PPQN} from "lib-dsp"
import {DefaultObservableValue, int, Option, panic, TimeSpan} from "lib-std"
import {showApproveDialog, showProcessDialog, showProcessMonolog} from "@/ui/components/dialogs.tsx"
import {Promises, Wait} from "lib-runtime"
import {AnimationFrame, Errors, Files} from "lib-dom"
import {encodeWavFloat} from "@/wav"
import {ProjectMeta} from "@/project/ProjectMeta"
import {ExportStemsConfiguration} from "studio-shared"
import JSZip from "jszip"

export namespace EngineOfflineRenderer {
    export const start = async (source: Project,
                                meta: ProjectMeta,
                                optExportConfiguration: Option<ExportStemsConfiguration>,
                                sampleRate: int = 48_000): Promise<void> => {
        const project = source.copy()
        const numStems = ExportStemsConfiguration.countStems(optExportConfiguration)
        const progress = new DefaultObservableValue(0.0)
        const dialogHandler = showProcessDialog("Rendering...", progress)
        project.boxGraph.beginTransaction()
        project.timelineBox.loopArea.enabled.setValue(false)
        project.boxGraph.endTransaction()
        const durationInPulses = project.timelineBox.durationInPulses.getValue()
        const numSamples = PPQN.pulsesToSamples(durationInPulses, project.bpm, sampleRate)
        const context = new OfflineAudioContext(numStems * 2, numSamples, sampleRate)
        const durationInSeconds = numSamples / sampleRate
        const engineFactory = await EngineWorklet.bootFactory(context)
        const engineWorklet = engineFactory.create(context =>
            new EngineWorklet(context, project, optExportConfiguration.unwrapOrUndefined()))
        engineWorklet.isPlaying().setValue(true)
        engineWorklet.connect(context.destination)
        await engineWorklet.isReady()
        while (!await engineWorklet.queryLoadingComplete()) {await Wait.timeSpan(TimeSpan.seconds(1))}
        const terminable = AnimationFrame.add(() => progress.setValue(context.currentTime / durationInSeconds))
        const buffer = await context.startRendering()
        terminable.terminate()
        dialogHandler.close()
        project.terminate()
        if (optExportConfiguration.isEmpty()) {
            await saveWavFile(buffer, meta)
        } else {
            await saveZipFile(buffer, meta, Object.values(optExportConfiguration.unwrap()).map(({fileName}) => fileName))
        }
    }

    const saveWavFile = async (buffer: AudioBuffer, meta: ProjectMeta) => {
        const approveResult = await Promises.tryCatch(showApproveDialog({
            headline: "Save Wav-File",
            message: "",
            approveText: "Save"
        }))
        if (approveResult.status === "rejected") {return}
        const wavFile = encodeWavFloat(buffer)
        const suggestedName = `${meta.name}.wav`
        const saveResult = await Promises.tryCatch(Files.save(wavFile, {suggestedName}))
        if (saveResult.status === "rejected" && !Errors.isAbort(saveResult.error)) {
            panic(String(saveResult.error))
        }
    }

    const saveZipFile = async (buffer: AudioBuffer, meta: ProjectMeta, trackNames: ReadonlyArray<string>) => {
        const dialogHandler = showProcessMonolog("Creating Zip File...")
        const numStems = buffer.numberOfChannels >> 1
        const zip = new JSZip()
        for (let stemIndex = 0; stemIndex < numStems; stemIndex++) {
            const l = buffer.getChannelData(stemIndex * 2 + 0)
            const r = buffer.getChannelData(stemIndex * 2 + 1)
            const file = encodeWavFloat({channels: [l, r], sampleRate: buffer.sampleRate, numFrames: buffer.length})
            zip.file(`${trackNames[stemIndex]}.wav`, file, {binary: true})
        }
        const arrayBuffer = await zip.generateAsync({
            type: "arraybuffer",
            compression: "DEFLATE",
            compressionOptions: {level: 6}
        })
        dialogHandler.close()
        const approveResult = await Promises.tryCatch(showApproveDialog({
            headline: "Save Zip",
            message: `Size: ${arrayBuffer.byteLength >> 20}M`,
            approveText: "Save"
        }))
        if (approveResult.status === "rejected") {return}
        const saveResult = await Promises.tryCatch(Files.save(arrayBuffer, {suggestedName: `${meta.name}.zip`}))
        if (saveResult.status === "rejected") {
            panic(String(saveResult.error))
        }
    }
}