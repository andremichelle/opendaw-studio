import {Messenger} from "opendaw-runtime"
import {OpfsWorker, PeakWorker} from "opendaw-fusion"

const messenger: Messenger = Messenger.for(self)

OpfsWorker.init(messenger)
PeakWorker.install(messenger)