import {Box, Vertex} from "opendaw-box"
import {Predicate} from "opendaw-std"
import {SelectableVertex} from "@/ui/selection/SelectableVertex"

export const isVertexOfBox = (predicate: Predicate<Box>): Predicate<SelectableVertex> => (vertex: Vertex) => predicate(vertex.box)