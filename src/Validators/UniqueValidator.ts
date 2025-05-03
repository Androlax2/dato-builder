import type {Validator} from "./types";

export type UniqueValidatorConfig = boolean | undefined;

export default class UniqueValidator implements Validator {
    key = "unique";

    build() {
        return {};
    }
}
