// noinspection PointlessBooleanExpressionJS

import {describe, expect, it} from "vitest"
import {Html} from "./html"

describe("Html", () => {
    it("buildClassList", () => {
        expect(Html.buildClassList()).equals("")
        expect(Html.buildClassList(false && "foo")).equals("")
        // @ts-ignore
        expect(Html.buildClassList(undefined && "foo")).equals("")
        expect(Html.buildClassList(true && "foo")).equals("foo")
        expect(Html.buildClassList("abc", false && "foo")).equals("abc")
        // @ts-ignore
        expect(Html.buildClassList("abc", undefined && "foo")).equals("abc")
        expect(Html.buildClassList("abc", true && "foo")).equals("abc foo")
    })
})