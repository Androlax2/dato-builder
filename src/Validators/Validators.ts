import NumberRangeValidator from "./NumberRangeValidator";
import RequiredValidator from "./RequiredValidator";
import type {Validator} from "./types";

export type ValidatorConfig = {
    required?: boolean;
    number_range?: {
        min?: number;
        max?: number;
    };
};

export default class Validators {
    private validators: Validator[] = [];

    constructor(config: Partial<ValidatorConfig> = {}) {
        if (config.required) {
            this.validators.push(new RequiredValidator());
        }

        if (config.number_range) {
            this.validators.push(new NumberRangeValidator(config.number_range));
        }
    }

    build() {
        const result: Record<string, object> = {};

        for (const validator of this.validators) {
            result[validator.key] = validator.build();
        }

        return result;
    }
}
