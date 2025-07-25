import type { ValidatorConfig } from "../Validators/Validators.js";
import Field, { type FieldBody } from "./Field.js";

export type DateBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<ValidatorConfig, "required" | "date_range">;
};

export type DateConfig = {
  label: string;
  body?: DateBody;
};

export default class DateField extends Field {
  constructor({ label, body }: DateConfig) {
    super("date", {
      ...body,
      label,
    });
  }
}
