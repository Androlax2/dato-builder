import type {Validator} from "./types";

export type NumberRangeValidatorConfig = {
    min?: number;
    max?: number;
};

export default class NumberRangeValidator implements Validator {
    key = "number_range";

    constructor(private config: NumberRangeValidatorConfig) {
        if (!config.min && !config.max) {
            throw new Error(
                "At least one of min or max parameters must be specified for number_range.",
            );
        }
    }

    build() {
        return this.config;
    }
}
