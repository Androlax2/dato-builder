import type {Validator} from "./types";

export type SizeValidatorConfig = {
    min?: number;
    eq?: number;
    max?: number;
    multiple_of?: number;
};

export default class SizeValidator implements Validator {
    key = "size";

    constructor(private config: SizeValidatorConfig) {
        if (!config.min && !config.eq && !config.max && !config.multiple_of) {
            throw new Error("At least one parameter must be specified for size.");
        }
    }

    build() {
        return this.config;
    }
}
