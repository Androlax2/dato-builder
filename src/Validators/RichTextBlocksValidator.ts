import type {Validator} from "./types";

export type RichTextBlocksValidatorConfig = {
    item_types: string[];
};

export default class RichTextBlocksValidator implements Validator {
    key = "rich_text_blocks";

    constructor(private config: RichTextBlocksValidatorConfig) {
        if (
            !config.item_types ||
            !Array.isArray(config.item_types) ||
            config.item_types.length === 0
        ) {
            throw new Error(
                "item_types parameter must be a non-empty array for rich_text_blocks.",
            );
        }
    }

    build() {
        return this.config;
    }
}
