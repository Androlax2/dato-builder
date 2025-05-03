import type {Validator} from "./types";

export default class RequiredValidator implements Validator {
    key = "required";

    build() {
        return {};
    }
}
