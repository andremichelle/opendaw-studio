import { Block, ProcessInfo } from "@/worklet/processing.ts"
import { Event, ppqn } from "dsp"
import { Nullish } from "std"
import { AbstractProcessor } from "@/worklet/AbstractProcessor.ts"
import { UpdateEvent } from "@/worklet/UpdateClock.ts"

export abstract class EventProcessor extends AbstractProcessor {
	process({ blocks }: ProcessInfo): void {
		blocks.forEach((block) => {
			this.introduceBlock(block)
			const { index, p0, p1 } = block
			let anyEvents: Nullish<Array<Event>> = null
			let position = p0
			for (const event of this.eventInput.get(index)) {
				anyEvents?.forEach(event => this.handleEvent(block, event))
				anyEvents = null
				if (position < event.position) {
					this.processEvents(block, position, event.position)
					position = event.position
				}
				if (UpdateEvent.isOfType(event)) {
					this.updateParameter(event.position)
				} else {
					(anyEvents ??= []).push(event)
				}
			}
			anyEvents?.forEach(event => this.handleEvent(block, event))
			anyEvents = null
			if (position < p1) {
				this.processEvents(block, position, p1)
			}
		})
		this.eventInput.clear()
	}

	abstract handleEvent(block: Block, event: Event): void
	abstract processEvents(block: Block, from: ppqn, to: ppqn): void

	introduceBlock(_block: Block): void {}
}