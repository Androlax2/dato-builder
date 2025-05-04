import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type ExternalVideoBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<ValidatorConfig, "required">;
};

export type ExternalVideoConfig = {
  label: string;
  body?: ExternalVideoBody;
};

export default class ExternalVideo extends Field {
  constructor({ label, body }: ExternalVideoConfig) {
    super("video", {
      ...body,
      label,
    });
  }
}
