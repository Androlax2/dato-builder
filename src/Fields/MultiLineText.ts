import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type MultiLineTextBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<
    ValidatorConfig,
    "required" | "length" | "format" | "sanitized_html"
  >;
};

export type MultiLineTextConfig = {
  label: string;
  body?: MultiLineTextBody;
};

export default class MultiLineText extends Field {
  constructor({ label, body }: MultiLineTextConfig) {
    super("text", {
      ...body,
      label,
    });
  }
}
