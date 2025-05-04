import type {Validator} from "./types";

export type RequiredValidatorConfig = boolean | undefined;

export default class RequiredValidator implements Validator {
    key = "required";

    constructor(private config: RequiredValidatorConfig) {
        if (typeof config !== "boolean" && config !== undefined) {
            throw new Error("Invalid configuration for required validator.");
        }
    }

    build() {
        return this.config === true ? {} : undefined;
    }
}
