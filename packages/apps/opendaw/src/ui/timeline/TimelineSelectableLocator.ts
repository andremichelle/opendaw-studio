import {Coordinates, SelectableLocator} from "lib-std"
import {ppqn} from "lib-dsp"

import {BoxAdapter} from "studio-adapters"

export type TimelineCoordinates = Coordinates<ppqn, number>
export type TimelineSelectableLocator<A extends BoxAdapter> = SelectableLocator<A, ppqn, number>