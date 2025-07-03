import {panic} from "lib-std"
import {AnimationFrame, Browser} from "lib-dom"
import {PPQN} from "lib-dsp"
import {Promises} from "lib-runtime"
import {testFeatures} from "@/features"
import {MainThreadAudioLoaderManager} from "@/MainThreadAudioLoaderManager"
import {EngineWorklet, Project} from "studio-worklet-main"
import WorkletUrl from "studio-worklet-runtime/worker?worker&url"

window.name = "main"

requestAnimationFrame(async () => {
        console.debug("openDAW -> headless")
        console.debug("agent", Browser.userAgent)
        console.debug("isLocalHost", Browser.isLocalHost())
        console.debug("WorkletUrl", WorkletUrl)
        if (!window.crossOriginIsolated) {
            return panic("window must be crossOriginIsolated")
        }
        console.debug("booting...")
        document.body.textContent = "booting..."
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
            const {
                status,
                error,
                value: engineFactory
            } = await Promises.tryCatch(EngineWorklet.bootFactory(context, WorkletUrl))
            if (status === "rejected") {
                alert(`Could not boot EngineWorklet (${error})`)
                return
            }
            const audioManager = new MainThreadAudioLoaderManager(context)
            const project = Project.load({audioManager}, await fetch("subset.od").then(x => x.arrayBuffer()))
            const worklet = engineFactory.create(context => new EngineWorklet(context, project))
            await worklet.isReady()
            while (!await worklet.queryLoadingComplete()) {}
            worklet.connect(context.destination)
            worklet.isPlaying().setValue(true)
            AnimationFrame.add(() => {
                const ppqn = worklet.position().getValue()
                const {bars, beats} = PPQN.toParts(ppqn)
                document.body.textContent = `${bars + 1}:${beats + 1}`
            })
        }
        if (context.state === "suspended") {
            window.addEventListener("click",
                async () => await context.resume().then(() =>
                    console.debug(`AudioContext resumed (${context.state})`)), {capture: true, once: true})
        }
        AnimationFrame.start()
        document.querySelector("#preloader")?.remove()
    }
)