import {Promises} from "lib-runtime"

const WorkletUrl = new URL("../node_modules/@opendaw/bundle-worklet/dist/index.js", import.meta.url).href

document.addEventListener("DOMContentLoaded", async () => {
    const context = new AudioContext()
    console.log("Worklet URL:", WorkletUrl)
    const {status} = await Promises.tryCatch(context.audioWorklet.addModule(WorkletUrl))
    console.debug(status)
    const workletNode = new AudioWorkletNode(context, "engine-processor") // throws an error
    console.debug(workletNode)
})