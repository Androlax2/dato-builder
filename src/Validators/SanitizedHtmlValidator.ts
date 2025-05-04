import type { Validator } from "./types";

export type SanitizedHtmlValidatorConfig = {
  /**
   * Checks for the presence of malicious code in HTML fields: content is valid if no dangerous code is present.
   */
  sanitize_before_validation: boolean;
};

export default class SanitizedHtmlValidator implements Validator {
  key = "sanitized_html";

  constructor(private config: SanitizedHtmlValidatorConfig) {}

  build() {
    return {
      sanitize_before_validation: this.config.sanitize_before_validation,
    };
  }
}
