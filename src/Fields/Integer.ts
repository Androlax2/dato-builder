import type {ValidatorConfig} from "../Validators/Validators";
import Field, {type FieldBody} from "./Field";

export type IntegerBody = Omit<FieldBody, "label"> & {
    validators?: Pick<ValidatorConfig, "required" | "number_range">;
};

export default class Integer extends Field {
    constructor(label: string, options?: IntegerBody) {
        super("integer", {
            ...options,
            label,
        });
    }
}
