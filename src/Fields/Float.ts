import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type FloatBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<ValidatorConfig, "required" | "number_range">;
};

export type FloatConfig = {
  label: string;
  body?: FloatBody;
};

export default class Float extends Field {
  constructor({ label, body }: FloatConfig) {
    super("float", {
      ...body,
      label,
    });
  }
}
