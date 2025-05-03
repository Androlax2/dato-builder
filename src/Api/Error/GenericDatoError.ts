import type {ParsedError} from "../ParsedError";

export default class GenericDatoError extends Error {
    public readonly info: ParsedError;

    constructor(info: ParsedError) {
        // Build a message like "[INVALID_FIELD/VALIDATION_UNIQUENESS] {...}"
        const codeSegment = info.innerCode
            ? `${info.outerCode}/${info.innerCode}`
            : info.outerCode;
        super(`[${codeSegment}] ${JSON.stringify(info.details)}`);

        this.name = "GenericDatoError";
        this.info = info;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}
