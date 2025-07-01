import {Project} from "@/project/Project"
import {
    AudioEffectDeviceBoxAdapter,
    DeviceBoxAdapter,
    DeviceHost,
    MidiEffectDeviceAdapter
} from "studio-adapters"
import {DeviceEditorFactory} from "@/ui/devices/DeviceEditorFactory"
import {Exec, Lifecycle, Option, Subscription, Terminable, Terminator, UUID} from "lib-std"
import {JsxValue} from "lib-jsx"
import {Box} from "lib-box"

type DeviceFactory = (project: Project, lifecycle: Lifecycle, box: Box, deviceHost: DeviceHost) => JsxValue

export class DeviceMount implements Terminable {
    static forMidiEffect(project: Project,
                         adapter: MidiEffectDeviceAdapter,
                         deviceHost: DeviceHost,
                         invalidateSignal: Exec): DeviceMount {
        return new DeviceMount(project, adapter, deviceHost, DeviceEditorFactory.toMidiEffectDeviceEditor, invalidateSignal)
    }

    static forInstrument(project: Project,
                         adapter: DeviceBoxAdapter,
                         deviceHost: DeviceHost,
                         invalidateSignal: Exec): DeviceMount {
        return new DeviceMount(project,
            adapter,
            deviceHost,
            (project, lifecycle, box) => DeviceEditorFactory.toInstrumentDeviceEditor(project, lifecycle, box, deviceHost),
            invalidateSignal)
    }

    static forAudioEffect(project: Project,
                          adapter: AudioEffectDeviceBoxAdapter,
                          deviceHost: DeviceHost,
                          invalidateSignal: Exec): DeviceMount {
        return new DeviceMount(project, adapter, deviceHost, DeviceEditorFactory.toAudioEffectDeviceEditor, invalidateSignal)
    }

    readonly #terminator: Terminator = new Terminator()

    readonly #project: Project
    readonly #adapter: DeviceBoxAdapter
    readonly #deviceHost: DeviceHost
    readonly #factory: DeviceFactory
    readonly #invalidateSignal: Exec

    readonly #subscription: Subscription

    #optEditor: Option<JsxValue> = Option.None

    private constructor(project: Project,
                        adapter: DeviceBoxAdapter,
                        deviceHost: DeviceHost,
                        factory: DeviceFactory,
                        invalidateSignal: Exec) {
        this.#project = project
        this.#adapter = adapter
        this.#deviceHost = deviceHost
        this.#factory = factory
        this.#invalidateSignal = invalidateSignal

        this.#subscription = adapter.minimizedField.subscribe(() => {
            this.#terminator.terminate()
            this.#optEditor = Option.None
            this.#invalidateSignal()
        })
    }

    editor(): JsxValue {
        return this.#optEditor.match({
            none: () => {
                const editor = this.#factory(this.#project, this.#terminator, this.#adapter.box, this.#deviceHost)
                this.#optEditor = Option.wrap(editor)
                return editor
            },
            some: editor => editor
        })
    }

    get uuid(): UUID.Format {return this.#adapter.uuid}

    terminate(): void {
        this.#optEditor = Option.None
        this.#subscription.terminate()
        this.#terminator.terminate()
        this.#invalidateSignal()
    }
}