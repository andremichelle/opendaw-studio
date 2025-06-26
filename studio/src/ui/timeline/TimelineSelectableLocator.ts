import {Coordinates, SelectableLocator} from "std"
import {ppqn} from "dsp"

import {BoxAdapter} from "@core/shared/BoxAdapter"

export type TimelineCoordinates = Coordinates<ppqn, number>
export type TimelineSelectableLocator<A extends BoxAdapter> = SelectableLocator<A, ppqn, number>