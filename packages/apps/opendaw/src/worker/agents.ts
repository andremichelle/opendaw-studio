import {Messenger} from "lib-runtime"
import {OpfsWorker, PeakWorker} from "lib-fusion"

const messenger: Messenger = Messenger.for(self)

OpfsWorker.init(messenger)
PeakWorker.install(messenger)