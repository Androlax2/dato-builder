import type {Validator} from "./types";

export type RequiredSeoFieldsValidatorConfig = {
    title?: boolean;
    description?: boolean;
    image?: boolean;
    twitter_card?: boolean;
};

export default class RequiredSeoFieldsValidator implements Validator {
    key = "required_seo_fields";

    constructor(private config: RequiredSeoFieldsValidatorConfig) {
        if (
            !config.title &&
            !config.description &&
            !config.image &&
            !config.twitter_card
        ) {
            throw new Error(
                "At least one parameter must be specified for required_seo_fields.",
            );
        }
    }

    build() {
        return this.config;
    }
}
