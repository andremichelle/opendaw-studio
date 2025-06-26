import "./main.sass"
import {App} from "@/ui/App.tsx"
import {Option, panic, Procedure, unitValue, UUID} from "std"
import {StudioService} from "@/service/StudioService"
import {UIAudioManager} from "@/project/UIAudioManager"
import {AudioData} from "@/audio-engine-shared/AudioData.ts"
import {showCacheDialog, showErrorDialog, showInfoDialog} from "@/ui/components/dialogs.tsx"
import {installCursors} from "@/ui/Cursors.ts"
import {BuildInfo} from "./BuildInfo"
import {Surface} from "@/ui/surface/Surface.tsx"
import {replaceChildren} from "jsx"
import {ContextMenu} from "@/ui/ContextMenu.ts"
import {Spotlight} from "@/ui/spotlight/Spotlight.tsx"
import {SampleApi} from "@/service/SampleApi.ts"
import {testFeatures} from "@/features.ts"
import {MissingFeature} from "@/ui/MissingFeature.tsx"
import {UpdateMessage} from "@/ui/UpdateMessage.tsx"
import {AudioServerApi} from "@/audio/AudioServerApi"
import {AudioMetaData} from "@/audio/AudioMetaData"
import {AudioStorage} from "@/audio/AudioStorage"
import {showStoragePersistDialog} from "@/AppDialogs"
import {Promises} from "runtime"
import {AnimationFrame, Browser, Events, Keyboard} from "dom"
import {AudioOutputDevice} from "@/audio/AudioOutputDevice"
import {FontLoader} from "@/ui/FontLoader"
import {AudioWorklets} from "@/audio-engine/AudioWorklets"
import {ErrorHandler} from "@/errors/ErrorHandler.ts"

window.name = "main"

const loadBuildInfo = async () => fetch(`/build-info.json?v=${Date.now()}`).then(x => x.json().then(x => x as BuildInfo))

requestAnimationFrame(async () => {
        if (!window.crossOriginIsolated) {return panic("window must be crossOriginIsolated")}
        console.debug("booting...")
        await FontLoader.load()
        const testFeaturesResult = await Promises.tryCatch(testFeatures())
        if (testFeaturesResult.status === "rejected") {
            document.querySelector("#preloader")?.remove()
            replaceChildren(document.body, MissingFeature({error: testFeaturesResult.error}))
            return
        }
        const buildInfo: BuildInfo = await loadBuildInfo()
        console.debug("buildInfo", buildInfo)
        console.debug("isLocalHost", Browser.isLocalHost())
        console.debug("agent", Browser.userAgent)
        const sampleRate = Browser.isFirefox() ? undefined : 48000
        console.debug("requesting custom sampleRate", sampleRate ?? "'No (Firefox)'")
        const context = new AudioContext({sampleRate, latencyHint: 0})
        console.debug(`AudioContext state: ${context.state}, sampleRate: ${context.sampleRate}`)
        const audioWorklets = await Promises.tryCatch(AudioWorklets.install(context))
        if (audioWorklets.status === "rejected") {
            showErrorDialog("Audio",
                "Boot Error", `Could not boot audio-worklets (${audioWorklets.error})`, Option.None)
            return
        }
        if (context.state === "suspended") {
            window.addEventListener("click",
                async () => await context.resume().then(() =>
                    console.debug(`AudioContext resumed (${context.state})`)), {capture: true, once: true})
        }
        const audioDevices = await AudioOutputDevice.create(context)
        const audioManager = new UIAudioManager({
            fetch: async (uuid: UUID.Format, progress: Procedure<unitValue>): Promise<[AudioData, AudioMetaData]> =>
                SampleApi.load(context, uuid, progress)
        } satisfies AudioServerApi, context)
        const service: StudioService =
            new StudioService(context, audioWorklets.value, audioDevices, audioManager, buildInfo)
        const errorHandler = new ErrorHandler(service)
        const surface = Surface.main({
            config: (surface: Surface) => {
                surface.ownAll(
                    Events.subscribe(surface.owner, "keydown", event => {
                        if (event.defaultPrevented) {return}
                        if (Keyboard.isControlKey(event) && event.key.toLowerCase() === "z") {
                            if (event.shiftKey) {
                                service.runIfProject(project => project.editing.redo())
                            } else {
                                service.runIfProject(project => project.editing.undo())
                            }
                        }
                    }),
                    ContextMenu.install(surface.owner),
                    Spotlight.install(surface, service)
                )
            }
        }, errorHandler)
        document.querySelector("#preloader")?.remove()
        document.addEventListener("touchmove", (event: TouchEvent) => event.preventDefault(), {passive: false})
        replaceChildren(surface.ground, App(service))
        AnimationFrame.start()
        installCursors()
        if (buildInfo.env === "production" && !Browser.isLocalHost()) {
            const uuid = buildInfo.uuid
            const sourceCss = document.querySelector<HTMLLinkElement>("link[rel='stylesheet']")?.href ?? ""
            const sourceCode = document.querySelector<HTMLScriptElement>("script[src]")?.src ?? ""
            if (!sourceCss.includes(uuid) || !sourceCode.includes(uuid)) {
                console.warn("Cache issue:")
                console.warn("expected uuid", uuid)
                console.warn("sourceCss", sourceCss)
                console.warn("sourceCode", sourceCode)
                showCacheDialog()
                return
            }
            const checkExtensions = setInterval(() => {
                if (document.scripts.length > 1) {
                    showInfoDialog({
                        headline: "Warning",
                        message: "Please disable extensions to avoid undefined behavior.",
                        okText: "Ignore"
                    }).then()
                    clearInterval(checkExtensions)
                }
            }, 5_000)
            const checkUpdates = setInterval(async () => {
                if (!navigator.onLine) {return}
                const {status, value: newBuildInfo} = await Promises.tryCatch(loadBuildInfo())
                if (status === "resolved" && newBuildInfo.uuid !== undefined && newBuildInfo.uuid !== buildInfo.uuid) {
                    document.body.prepend(UpdateMessage())
                    console.warn("A new version is online.")
                    clearInterval(checkUpdates)
                }
            }, 5_000)
        } else {
            console.debug("No production checks (build version & updates).")
        }
        if (Browser.isFirefox()) {
            const persisted = await Promises.tryCatch(navigator.storage.persisted())
            console.debug("Firefox.isPersisted", persisted.value)
            if (persisted.status === "resolved" && !persisted.value) {
                await Promises.tryCatch(showStoragePersistDialog())
            }
        }
        // delete obsolete indexedDB
        try {indexedDB.deleteDatabase("audio-file-cache")} catch (_: any) {}
        // delete obsolete samples
        AudioStorage.clean().then()
    }
)