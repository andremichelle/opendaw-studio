import {panic, UUID} from "lib-std"
import {Browser} from "lib-dom"
import {Promises} from "lib-runtime"
import {testFeatures} from "@/features"
import {EngineWorklet} from "@/audio-engine/EngineWorklet"
import {Project} from "@/project/Project"
import {AudioLoader} from "studio-adapters"

window.name = "main"

requestAnimationFrame(async () => {
        console.debug("openDAW -> headless")
        console.debug("agent", Browser.userAgent)
        console.debug("isLocalHost", Browser.isLocalHost())
        if (!window.crossOriginIsolated) {return panic("window must be crossOriginIsolated")}
        console.debug("booting...")
        {
            const {status, error} = await Promises.tryCatch(testFeatures())
            if (status === "rejected") {
                document.querySelector("#preloader")?.remove()
                alert(`Could not test features (${error})`)
                return
            }
        }
        const context = new AudioContext({latencyHint: 0})
        console.debug(`AudioContext state: ${context.state}, sampleRate: ${context.sampleRate}`)
        {
            const {status, error, value} = await Promises.tryCatch(EngineWorklet.bootFactory(context))
            if (status === "rejected") {
                alert(`Could not boot EngineWorklet (${error})`)
                return
            }

            const project = Project.load({
                audioManager: {
                    getOrCreateAudioLoader(_uuid: UUID.Format): AudioLoader {
                        return panic("sample are not yet implemented")
                    }
                }
            }, await fetch("asleep.od").then(x => x.arrayBuffer()))
            const worklet = value.create(context => new EngineWorklet(context, project))
            console.debug(worklet)
            worklet.connect(context.destination)
            worklet.isPlaying().setValue(true)
        }
        if (context.state === "suspended") {
            window.addEventListener("click",
                async () => await context.resume().then(() =>
                    console.debug(`AudioContext resumed (${context.state})`)), {capture: true, once: true})
        }
        document.querySelector("#preloader")?.remove()
    }
)