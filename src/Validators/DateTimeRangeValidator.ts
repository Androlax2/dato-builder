import type {Validator} from "./types";

export type DateTimeRangeValidatorConfig = {
    min?: Date;
    max?: Date;
};

export default class DateTimeRangeValidator implements Validator {
    key = "date_time_range";

    constructor(private config: DateTimeRangeValidatorConfig) {
        if (!config.min && !config.max) {
            throw new Error(
                "At least one of min or max parameters must be specified for date_time_range.",
            );
        }
    }

    build() {
        return {
            min: this.config.min ? this.config.min.toISOString() : undefined,
            max: this.config.max ? this.config.max.toISOString() : undefined,
        };
    }
}
