import {Nullable} from "./lang"

export namespace Generators {
    export function* empty<T>(): Generator<T> {return}

    export const next = <T>(generator: Generator<T>): Nullable<T> => {
        const {value, done} = generator.next()
        return done ? null : value
    }

    export function* flatten<T>(...generators: Iterable<T>[]): Generator<T> {
        for (const generator of generators) {
            for (const value of generator) {
                yield value
            }
        }
    }
}