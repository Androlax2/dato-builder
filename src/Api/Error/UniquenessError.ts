import type { ParsedError } from "../ParsedError.js";
import GenericDatoError from "./GenericDatoError.js";

export default class UniquenessError extends GenericDatoError {
  constructor(info: ParsedError) {
    super(info);
    this.name = "UniquenessError";

    // restore correct [[Prototype]]
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
