import type {ValidatorConfig} from "../Validators/Validators";
import Field, {type FieldBody} from "./Field";

export type MultiLineTextBody = Omit<FieldBody, "label"> & {
    validators?: Pick<
        ValidatorConfig,
        "required" | "length" | "format" | "sanitized_html"
    >;
};

export default class MultiLineText extends Field {
    constructor(label: string, options?: MultiLineTextBody) {
        super("text", {
            ...options,
            label,
        });
    }
}
