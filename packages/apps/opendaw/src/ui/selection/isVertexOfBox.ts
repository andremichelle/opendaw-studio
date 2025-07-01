import {Box, Vertex} from "lib-box"
import {Predicate} from "lib-std"
import {SelectableVertex} from "@/ui/selection/SelectableVertex"

export const isVertexOfBox = (predicate: Predicate<Box>): Predicate<SelectableVertex> => (vertex: Vertex) => predicate(vertex.box)