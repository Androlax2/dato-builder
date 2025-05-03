import type {Validator} from "./types";

export default class NumberRangeValidator implements Validator {
    key = "number_range";

    constructor(private config: { min?: number; max?: number }) {
    }

    build() {
        const {min, max} = this.config;

        if (min == null && max == null) {
            throw new Error(
                "At least one of the parameters must be specified for number_range.",
            );
        }

        return {min, max};
    }
}
