import {describe, expect, it} from "vitest"
import {isValidIdentifier} from "./lang"

describe("lang", () => {
    it("isValidIdentifier", () => {
        expect(isValidIdentifier("")).false
        expect(isValidIdentifier("42")).false
        expect(isValidIdentifier("-")).false
        expect(isValidIdentifier("+")).false
        expect(isValidIdentifier("/")).false
        expect(isValidIdentifier("|")).false
        expect(isValidIdentifier("$")).true
        expect(isValidIdentifier("A")).true
        expect(isValidIdentifier("$0")).true
    })
})