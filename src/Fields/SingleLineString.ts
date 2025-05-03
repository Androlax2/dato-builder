import type {ValidatorConfig} from "../Validators/Validators";
import Field, {type FieldBody} from "./Field";

export type SingleLineStringBody = Omit<FieldBody, "label"> & {
    validators?: Pick<
        ValidatorConfig,
        "required" | "unique" | "length" | "format" | "enum"
    >;
};

export default class SingleLineString extends Field {
    constructor(label: string, body?: SingleLineStringBody) {
        super("string", {
            ...body,
            label,
        });
    }
}
