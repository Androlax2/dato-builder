import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type LocationBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<ValidatorConfig, "required">;
};

export type LocationConfig = {
  label: string;
  body?: LocationBody;
};

export default class Location extends Field {
  constructor({ label, body }: LocationConfig) {
    super("lat_lon", {
      ...body,
      label,
    });
  }
}
