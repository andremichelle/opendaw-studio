import {assert, ByteArrayInput, Hash, int, tryCatch} from "lib-std"
import {Project} from "@/project/Project"
import {Commit, CommitType} from "./Commit"
import {StudioService} from "@/service/StudioService"
import {Updates} from "lib-box"
import {Wait} from "lib-runtime"
import {showProcessMonolog} from "@/ui/components/dialogs"

export class SyncLogReader {
    static async unwrap(service: StudioService, buffer: ArrayBuffer): Promise<{
        project: Project,
        lastCommit: Commit,
        numCommits: int
    }> {
        console.debug("SyncLogReader.unwrapping begin")
        const input = new ByteArrayInput(buffer)
        const firstCommit = Commit.deserialize(input)
        assert(firstCommit.type === CommitType.Init, "First commit must be typed with CommitType.Init")
        const project = Project.load(service, firstCommit.payload)
        const {boxGraph} = project
        const label = document.createElement("div")
        label.style.margin = "1em 0"
        const handler = showProcessMonolog("Unwrapping SyncLog", label)
        let prevCommit: Commit = firstCommit
        let lastFrame = Date.now()
        let numCommits = 0 | 0
        while (true) {
            const {status, error, value: nextCommit} = tryCatch(() => Commit.deserialize(input))
            numCommits++
            label.textContent = `${numCommits} commits unwrapped.`
            if (status === "failure") {
                if (error instanceof RangeError) { // end of file
                    break
                }
                throw error
            }
            assert(Hash.equals(prevCommit.thisHash, nextCommit.prevHash), "SyncLog inconsistency")
            // We have not implemented any other types so let's accepts only updates
            if (nextCommit.type === CommitType.Open) {
                console.debug("Opened at", new Date(nextCommit.date).toISOString())
            } else if (nextCommit.type === CommitType.Updates) {
                const updates = Updates.decode(new ByteArrayInput(nextCommit.payload))
                boxGraph.beginTransaction()
                updates.forEach(update => update.forward(boxGraph))
                boxGraph.endTransaction()
            }
            prevCommit = nextCommit
            const now = Date.now()
            if (now - lastFrame > 16) {
                console.debug("Pause unwrapping to allow browser to render a frame.")
                await Wait.frame()
                lastFrame = now
            }
        }
        console.debug("SyncLogReader.unwrapping complete")
        handler.close()
        return Promise.resolve({project, lastCommit: prevCommit, numCommits})
    }
}