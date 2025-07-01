import "lib-std";
import { ObjectField, FieldConstruct, NoPointers, Int32Field, BooleanField, UnreferenceableType } from "lib-box";

//
//   ___          ___                 
//  | _ ) _____ _| __|__ _ _ __ _ ___ 
//  | _ \/ _ \ \ / _/ _ \ '_/ _` / -_)
//  |___/\___/_\_\_|\___/_| \__, \___|
//                         |___/
//
//  auto-generated | do not edit | blame andre.michelle@gmail.com
//
export type DrumStepFields = {10: /* key */ Int32Field
    11: /* transpose */ Int32Field
    12: /* mode: true */ BooleanField
    13: /* slide */ BooleanField
    14: /* accent */ BooleanField
    				};

export class DrumStep extends ObjectField<DrumStepFields> {
    static create(construct: FieldConstruct<UnreferenceableType>): DrumStep {
        return new DrumStep(construct)
    }

    private constructor(construct: FieldConstruct<UnreferenceableType>) {
        super(construct)
    }

    get key(): Int32Field {
        return this.getField(10)
    }

    get transpose(): Int32Field {
        return this.getField(11)
    }

    get mode(): BooleanField {
        return this.getField(12)
    }

    get slide(): BooleanField {
        return this.getField(13)
    }

    get accent(): BooleanField {
        return this.getField(14)
    }

    initializeFields(): DrumStepFields {
        return {10: Int32Field.create({parent: this,fieldKey: 10,fieldName: "key",pointerRules: NoPointers},),11: Int32Field.create({parent: this,fieldKey: 11,fieldName: "transpose",pointerRules: NoPointers},),12: BooleanField.create({parent: this,fieldKey: 12,fieldName: "mode",pointerRules: NoPointers},true),13: BooleanField.create({parent: this,fieldKey: 13,fieldName: "slide",pointerRules: NoPointers},),14: BooleanField.create({parent: this,fieldKey: 14,fieldName: "accent",pointerRules: NoPointers},)}
    }
}
