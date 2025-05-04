import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type DateTimeBody = Omit<FieldBody, "label"> & {
  validators?: Pick<ValidatorConfig, "required" | "date_time_range">;
};

export type DateTimeConfig = {
  label: string;
  body?: DateTimeBody;
};

export default class DateTime extends Field {
  constructor({ label, body }: DateTimeConfig) {
    super("date_time", {
      ...body,
      label,
    });
  }
}
