export interface Bijective<X, Y> {
    fx: (x: X) => Y
    fy: (y: Y) => X
}