import type {Validator} from "./types";

export type DescriptionLengthValidatorConfig = {
    min?: number;
    max?: number;
};

export default class DescriptionLengthValidator implements Validator {
    key = "description_length";

    constructor(private config: DescriptionLengthValidatorConfig) {
        if (!config.min && !config.max) {
            throw new Error(
                "At least one of min or max parameters must be specified for description_length.",
            );
        }
    }

    build() {
        return this.config;
    }
}
