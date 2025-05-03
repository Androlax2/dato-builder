import EnumValidator, {type EnumValidatorConfig} from "./EnumValidator";
import FormatValidator, {type FormatValidatorConfig} from "./FormatValidator";
import LengthValidator, {type LengthValidatorConfig} from "./LengthValidator";
import NumberRangeValidator, {type NumberRangeValidatorConfig,} from "./NumberRangeValidator";
import RequiredValidator, {type RequiredValidatorConfig,} from "./RequiredValidator";
import SanitizedHtmlValidator, {type SanitizedHtmlValidatorConfig,} from "./SanitizedHtmlValidator";
import UniqueValidator, {type UniqueValidatorConfig} from "./UniqueValidator";
import type {Validator} from "./types";

export type ValidatorConfig = Partial<{
    required: RequiredValidatorConfig;
    number_range: NumberRangeValidatorConfig;
    unique: UniqueValidatorConfig;
    format: FormatValidatorConfig;
    length: LengthValidatorConfig;
    enum: EnumValidatorConfig;
    sanitized_html: SanitizedHtmlValidatorConfig;
}>;

export default class Validators {
    private validators: Validator[] = [];

    constructor(config: Partial<ValidatorConfig> = {}) {
        if (config.required) {
            this.validators.push(new RequiredValidator());
        }

        if (config.number_range) {
            this.validators.push(new NumberRangeValidator(config.number_range));
        }

        if (config.unique) {
            this.validators.push(new UniqueValidator());
        }

        if (config.format) {
            this.validators.push(new FormatValidator(config.format));
        }

        if (config.length) {
            this.validators.push(new LengthValidator(config.length));
        }

        if (config.enum) {
            this.validators.push(new EnumValidator(config.enum));
        }

        if (config.sanitized_html) {
            this.validators.push(new SanitizedHtmlValidator(config.sanitized_html));
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
