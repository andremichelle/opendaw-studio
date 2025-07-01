const enum ADSRState {
    Idle,
    Attack,
    Decay,
    Sustain,
    Release,
}

export class ADSR {
    readonly #attack: number
    readonly #decay: number
    readonly #sustain: number
    readonly #release: number

    #state: ADSRState = ADSRState.Idle
    #value: number = 0.0
    #releaseStart: number = 0.0

    constructor(attack: number, decay: number, sustain: number, release: number) {
        this.#attack = attack * sampleRate
        this.#decay = decay * sampleRate
        this.#sustain = sustain
        this.#release = release * sampleRate
        this.#state = ADSRState.Attack
    }

    releaseNote() {
        if (this.#state !== ADSRState.Idle && this.#state !== ADSRState.Release) {
            this.#releaseStart = this.#value
            this.#state = ADSRState.Release
        }
    }

    isComplete(): boolean {return this.#state === ADSRState.Idle}

    process(): number {
        switch (this.#state) {
            case ADSRState.Attack:
                this.#value += 1.0 / this.#attack
                if (this.#value >= 1.0) {
                    this.#value = 1.0
                    this.#state = ADSRState.Decay
                }
                break

            case ADSRState.Decay:
                this.#value -= (1.0 - this.#sustain) / this.#decay
                if (this.#value <= this.#sustain) {
                    this.#value = this.#sustain
                    this.#state = ADSRState.Sustain
                }
                break

            case ADSRState.Release:
                this.#value -= this.#releaseStart / this.#release
                if (this.#value <= 0.0) {
                    this.#value = 0.0
                    this.#state = ADSRState.Idle
                }
                break
        }
        return this.#value
    }
}
