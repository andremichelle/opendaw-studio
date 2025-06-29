import {describe, expect, it} from "vitest"
import {AABB, Axis, CohenSutherland, Corner, Geom, Point, Rect, ValueAxis} from "./geom"

describe("Point helpers", () => {
    it("zero / create / clone", () => {
        const p0 = Point.zero()
        expect(p0).toEqual({x: 0, y: 0})

        const p1 = Point.create(1, 2)
        expect(p1).toEqual({x: 1, y: 2})

        const cloned = Point.clone(p1)
        expect(cloned).not.toBe(p1)
        expect(cloned).toEqual(p1)
    })

    it("length / distance", () => {
        expect(Point.length({x: 3, y: 4})).toBe(5)
        expect(
            Point.distance(Point.zero(), {x: 3, y: 4})
        ).toBe(5)
    })

    it("add / subtract / scaleBy / scaleTo", () => {
        const a = {x: 1, y: 2}
        const b = {x: 3, y: 4}

        expect(Point.add(a, b)).toEqual({x: 4, y: 6})
        expect(Point.subtract(b, a)).toEqual({x: 2, y: 2})
        expect(Point.scaleBy(a, 2)).toEqual({x: 2, y: 4})

        const scaled = Point.scaleTo({x: 3, y: 4}, 10)  // original length = 5
        expect(scaled).toEqual({x: 6, y: 8})
    })

    it("floor / fromClient", () => {
        const pf = Point.floor({x: 1.8, y: 2.2})
        expect(pf).toEqual({x: 1, y: 2})

        const client = Point.fromClient({clientX: 7, clientY: 9})
        expect(client).toEqual({x: 7, y: 9})
    })
})

describe("Rect helpers", () => {
    const r: Rect = {x: 1, y: 2, width: 3, height: 4}

    it("corners & center", () => {
        expect(Rect.corners(r)).toEqual([
            {x: 1, y: 2},
            {x: 4, y: 2},
            {x: 4, y: 6},
            {x: 1, y: 6}
        ])
        expect(Rect.center(r)).toEqual({x: 2.5, y: 4})
    })

    it("inflate", () => {
        expect(Rect.inflate(r, 1)).toEqual({x: 0, y: 1, width: 5, height: 6})
    })

    it("contains & isPointInside", () => {
        const outer: Rect = {x: 0, y: 0, width: 10, height: 10}
        expect(Rect.contains(outer, r)).toBe(true)
        expect(Rect.isPointInside({x: 1, y: 2}, r)).toBe(true)
        expect(Rect.isPointInside({x: 4, y: 6}, r)).toBe(true)     // on border
        expect(Rect.isPointInside({x: 5, y: 7}, r)).toBe(false)
    })

    it("intersect", () => {
        expect(Rect.intersect(r, {x: 2, y: 3, width: 5, height: 2})).toBe(true)
        expect(Rect.intersect(r, {x: 10, y: 10, width: 1, height: 1})).toBe(false)
    })

    it("axis & corner", () => {
        expect(Rect.axis(r, Axis.L)).toBe(1)
        expect(Rect.axis(r, Axis.R)).toBe(4)
        expect(Rect.corner(r, Corner.BR)).toEqual({x: 4, y: 6})
    })

    it("isEmpty", () => {
        expect(Rect.isEmpty({x: 0, y: 0, width: 0, height: 3})).toBe(true)
        expect(Rect.isEmpty({x: 0, y: 0, width: 3, height: 0})).toBe(true)
        expect(Rect.isEmpty(r)).toBe(false)
    })

    it("union mutates first rect", () => {
        const a: Rect = {x: 1, y: 1, width: 2, height: 2}
        const b: Rect = {x: 0, y: 0, width: 1, height: 1}

        Rect.union(a, b)
        expect(a).toEqual({x: 0, y: 0, width: 3, height: 3})

        // empty first rect should copy non-empty second rect
        const empty: Rect = {x: 0, y: 0, width: 0, height: 0}
        Rect.union(empty, b)
        expect(empty).toEqual(b)
    })
})

describe("AABB helpers", () => {
    const aabb: AABB = {xMin: 0, xMax: 10, yMin: 0, yMax: 10}

    it("width / height / center", () => {
        expect(AABB.width(aabb)).toBe(10)
        expect(AABB.height(aabb)).toBe(10)
        expect(AABB.center(aabb)).toEqual({x: 5, y: 5})
    })

    it("from copies values", () => {
        const target: AABB = {xMin: 0, xMax: 0, yMin: 0, yMax: 0}
        AABB.from(target, aabb)
        expect(target).toEqual(aabb)
    })

    it("extend & padding mutate aabb", () => {
        const copy: AABB = {...aabb}
        AABB.extend(copy, 2)
        expect(copy).toEqual({xMin: -2, xMax: 12, yMin: -2, yMax: 12})

        AABB.padding(copy, [1, 2, 3, 4])
        expect(copy).toEqual({xMin: -2 + 4, yMin: -2 + 1, xMax: 12 - 2, yMax: 12 - 3})
    })

    it("intersectPoint / intersectThat", () => {
        expect(AABB.intersectPoint(aabb, {x: 5, y: 5})).toBe(true)
        expect(AABB.intersectPoint(aabb, {x: 10, y: 10})).toBe(false) // right and bottom borders exclusive

        const other: AABB = {xMin: 5, xMax: 15, yMin: 5, yMax: 15}
        expect(AABB.intersectThat(aabb, other)).toBe(true)

        const outside: AABB = {xMin: 11, xMax: 12, yMin: 11, yMax: 12}
        expect(AABB.intersectThat(aabb, outside)).toBe(false)
    })
})

describe("Geom.outerTangentPoints", () => {
    it("computes expected tangent points for equal-radius circles", () => {
        const a = {x: 0, y: 0, r: 1}
        const b = {x: 4, y: 0, r: 1}

        const [pa, pb] = Geom.outerTangentPoints(a, b)

        // Points should lie on the top outer tangent (y > 0) and on each circle respectively
        expect(Point.distance(a, pa)).toBeCloseTo(a.r, 10)
        expect(Point.distance(b, pb)).toBeCloseTo(b.r, 10)
        // y coordinates should be equal for outer tangent points
        expect(pa.y).toBeCloseTo(pb.y, 10)
    })
})

describe("Cohen-Sutherland line/box test", () => {
    const xmin = 0, xmax = 10, ymin = 0, ymax = 10

    it("returns true when the segment crosses the box", () => {
        expect(
            CohenSutherland.intersects(xmin, xmax, ymin, ymax, -5, 5, 15, 5)
        ).toBe(true)
    })

    it("returns false for segment completely inside the box", () => {
        expect(
            CohenSutherland.intersects(xmin, xmax, ymin, ymax, 1, 1, 9, 9)
        ).toBe(false)
    })

    it("returns false for segment completely outside without intersection", () => {
        expect(
            CohenSutherland.intersects(xmin, xmax, ymin, ymax, -5, -5, -1, -1)
        ).toBe(false)
    })
})

describe("ValueAxis utilities", () => {
    it("Identity leaves values unchanged", () => {
        expect(ValueAxis.Identity.valueToAxis(7)).toBe(7)
        expect(ValueAxis.Identity.axisToValue(3)).toBe(3)
    })

    it("toClamped adapts existing axis", () => {
        const clamped = ValueAxis.toClamped(ValueAxis.Identity, 0, 10)
        expect(clamped.valueToAxis(15)).toBe(10)
        expect(clamped.axisToValue(-5)).toBe(0)
    })

    it("createClamped produces new clamped axis", () => {
        const c = ValueAxis.createClamped(-1, 1)
        expect(c.valueToAxis(2)).toBe(1)
        expect(c.axisToValue(-3)).toBe(-1)
    })
})