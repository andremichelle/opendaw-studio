import {Checkbox} from "@/ui/components/Checkbox.tsx"
import {Icon} from "@/ui/components/Icon.tsx"
import {createElement} from "jsx"
import {StudioService} from "@/service/StudioService"
import {Button} from "@/ui/components/Button.tsx"
import {Colors} from "@/ui/Colors.ts"
import {Lifecycle, MutableObservableValue} from "std"
import {IconSymbol} from "@core/IconSymbol.ts"

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const TransportGroup = ({lifecycle, service: {engine, transport}}: Construct) => (
    <div style={{display: "flex"}}>
        <Checkbox lifecycle={lifecycle}
                  model={MutableObservableValue.False}
                  appearance={{activeColor: "hsl(0, 50%, 50%)", tooltip: "Recording"}}>
            <Icon symbol={IconSymbol.Record}/>
        </Checkbox>
        <Checkbox lifecycle={lifecycle}
                  model={engine.isPlaying()}
                  appearance={{activeColor: "hsl(120, 50%, 50%)", tooltip: "Play"}}>
            <Icon symbol={IconSymbol.Play}/>
        </Checkbox>
        <Button lifecycle={lifecycle}
                onClick={() => {engine.stop()}}
                appearance={{activeColor: Colors.bright, tooltip: "Stop"}}>
            <Icon symbol={IconSymbol.Stop}/>
        </Button>
        <Checkbox lifecycle={lifecycle}
                  model={transport.loop}
                  appearance={{activeColor: Colors.gray, tooltip: "Loop"}}>
            <Icon symbol={IconSymbol.Loop}/>
        </Checkbox>
    </div>
)