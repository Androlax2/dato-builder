import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type IntegerBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<ValidatorConfig, "required" | "number_range">;
};

export type IntegerConfig = {
  label: string;
  body?: IntegerBody;
};

export default class Integer extends Field {
  constructor({ label, body }: IntegerConfig) {
    super("integer", {
      ...body,
      label,
    });
  }
}
