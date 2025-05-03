import type {Validator} from "./types";

export type NumberRangeValidatorConfig = {
    min?: number;
    max?: number;
};

export default class NumberRangeValidator implements Validator {
    key = "number_range";

    constructor(private config: NumberRangeValidatorConfig) {
        if (config.min == null && config.max == null) {
            throw new Error(
                "At least one of the parameters must be specified for number_range.",
            );
        }
    }

    build() {
        return {
            min: this.config.min,
            max: this.config.max,
        };
    }
}
