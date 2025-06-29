import {FloatArray, int, Procedure} from "lib-std"
import WorkerUrl from "../worker/agents.ts?worker&url"
import {Entry, OpfsProtocol, PeakProtocol} from "lib-fusion"
import {Communicator, Messenger} from "lib-runtime"

const messenger = Messenger.for(new Worker(WorkerUrl, {type: "module"}))

export const PeakAgent = Communicator.sender<PeakProtocol>(messenger.channel("peaks"),
    router => new class implements PeakProtocol {
        async generateAsync(
            progress: Procedure<number>,
            shifts: Uint8Array,
            frames: ReadonlyArray<FloatArray>,
            numFrames: int,
            numChannels: int): Promise<ArrayBufferLike> {
            return router.dispatchAndReturn(this.generateAsync, progress, shifts, frames, numFrames, numChannels)
        }
    })

export const OpfsAgent = Communicator.sender<OpfsProtocol>(messenger.channel("opfs"),
    router => new class implements OpfsProtocol {
        write(path: string, data: Uint8Array): Promise<void> {return router.dispatchAndReturn(this.write, path, data)}
        read(path: string): Promise<Uint8Array> {return router.dispatchAndReturn(this.read, path)}
        delete(path: string): Promise<void> {return router.dispatchAndReturn(this.delete, path)}
        list(path: string): Promise<ReadonlyArray<Entry>> {return router.dispatchAndReturn(this.list, path)}
    })