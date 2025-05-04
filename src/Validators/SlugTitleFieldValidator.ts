import type {Validator} from "./types";

export type SlugTitleFieldValidatorConfig = {
    title_field_id: string;
};

export default class SlugTitleFieldValidator implements Validator {
    key = "slug_title_field";

    constructor(private config: SlugTitleFieldValidatorConfig) {
        if (!config.title_field_id) {
            throw new Error(
                "title_field_id parameter is required for slug_title_field.",
            );
        }
    }

    build() {
        return this.config;
    }
}
