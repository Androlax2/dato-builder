import type {Validator} from "./types";

export type EnumValidatorConfig = {
    values: string[];
};

export default class EnumValidator implements Validator {
    key = "enum";

    constructor(private config: EnumValidatorConfig) {
        if (config.values.length === 0) {
            throw new Error("At least one value must be specified for enum.");
        }
    }

    build() {
        return {
            values: this.config.values,
        };
    }
}
