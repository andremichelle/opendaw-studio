import {Coordinates, SelectableLocator} from "opendaw-std"
import {ppqn} from "opendaw-dsp"

import {BoxAdapter} from "studio-shared"

export type TimelineCoordinates = Coordinates<ppqn, number>
export type TimelineSelectableLocator<A extends BoxAdapter> = SelectableLocator<A, ppqn, number>