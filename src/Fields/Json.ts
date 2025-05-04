import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type JsonBody = Omit<FieldBody, "label"> & {
  validators?: Pick<ValidatorConfig, "required">;
};

export type JsonConfig = {
  label: string;
  body?: JsonBody;
};

export default class Json extends Field {
  constructor({ label, body }: JsonConfig) {
    super("json", {
      ...body,
      label,
    });
  }
}
