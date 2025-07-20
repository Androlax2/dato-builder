import type { ParsedError } from "../ParsedError.js";
import GenericDatoError from "./GenericDatoError.js";

export default class NotFoundError extends GenericDatoError {
  constructor(info: ParsedError) {
    super(info);
    this.name = "NotFoundError";

    // restore correct [[Prototype]]
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
