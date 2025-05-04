import type {Validator} from "./types";

export type SlugFormatValidatorConfig = {
    custom_pattern?: RegExp;
    predefined_pattern?: "webpage_slug";
};

export default class SlugFormatValidator implements Validator {
    key = "slug_format";

    constructor(private config: SlugFormatValidatorConfig) {
        if (!config.custom_pattern && !config.predefined_pattern) {
            throw new Error(
                "At least one of custom_pattern or predefined_pattern parameters must be specified for slug_format.",
            );
        }

        if (config.custom_pattern && config.predefined_pattern) {
            throw new Error(
                "Only one of custom_pattern or predefined_pattern parameters must be specified for slug_format.",
            );
        }
    }

    build() {
        const {custom_pattern, predefined_pattern} = this.config;

        if (custom_pattern) {
            return {
                custom_pattern: custom_pattern.toString(),
            };
        }

        return {
            predefined_pattern,
        };
    }
}
