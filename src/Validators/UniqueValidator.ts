import type {Validator} from "./types";

export type UniqueValidatorConfig = boolean | undefined;

export default class UniqueValidator implements Validator {
    key = "unique";

    constructor(private config: UniqueValidatorConfig) {
        if (typeof config !== "boolean" && config !== undefined) {
            throw new Error("Invalid configuration for unique validator.");
        }
    }

    build() {
        return this.config === true ? {} : undefined;
    }
}
