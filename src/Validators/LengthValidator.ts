import type {Validator} from "./types";

export interface LengthValidatorConfig {
    min?: number;
    eq?: number;
    max?: number;
}

export default class LengthValidator implements Validator {
    key = "length";

    constructor(private config: LengthValidatorConfig) {
        if (config.min === null && config.max === null && config.eq === null) {
            throw new Error(
                "At least one of the parameters must be specified for length.",
            );
        }
    }

    build() {
        return {
            min: this.config.min,
            max: this.config.max,
            eq: this.config.eq,
        };
    }
}
