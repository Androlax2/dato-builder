import type {Validator} from "./types";

export type RequiredValidatorConfig = boolean | undefined;

export default class RequiredValidator implements Validator {
    key = "required";

    build() {
        return {};
    }
}
