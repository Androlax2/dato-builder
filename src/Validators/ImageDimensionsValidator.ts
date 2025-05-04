import type {Validator} from "./types";

export type ImageDimensionsValidatorConfig = {
    width_min_value?: number;
    width_max_value?: number;
    height_min_value?: number;
    height_max_value?: number;
};

export default class ImageDimensionsValidator implements Validator {
    key = "image_dimensions";

    constructor(private config: ImageDimensionsValidatorConfig) {
        if (
            !config.width_min_value &&
            !config.width_max_value &&
            !config.height_min_value &&
            !config.height_max_value
        ) {
            throw new Error(
                "At least one pair of height/width parameters must be specified for image_dimensions.",
            );
        }
    }

    build() {
        return this.config;
    }
}
