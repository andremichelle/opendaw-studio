export namespace Utils {
    export const getUniqueName = (existingNames: ReadonlyArray<string>, desiredName: string): string => {
        const existingSet = new Set(existingNames)
        let test = desiredName
        let counter = 1
        if (existingSet.has(desiredName) || existingSet.has(`${desiredName} 1`)) {
            counter = 2
        } else {
            return desiredName
        }
        while (existingSet.has(test = `${desiredName} ${counter++}`)) {}
        return test
    }
}