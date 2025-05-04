import type {Validator} from "./types";

export type StructuredTextInlineBlocksValidatorConfig = {
    item_types: string[];
};

export default class StructuredTextInlineBlocksValidator implements Validator {
    key = "structured_text_inline_blocks";

    constructor(private config: StructuredTextInlineBlocksValidatorConfig) {
        if (
            !config.item_types ||
            !Array.isArray(config.item_types) ||
            config.item_types.length === 0
        ) {
            throw new Error(
                "item_types parameter must be a non-empty array for structured_text_inline_blocks.",
            );
        }
    }

    build() {
        return this.config;
    }
}
