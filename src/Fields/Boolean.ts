import Field, { type FieldBody } from "./Field";

export type BooleanBody = Omit<FieldBody, "label">;

export type BooleanConfig = {
  label: string;
  body?: BooleanBody;
};

export default class BooleanField extends Field {
  constructor({ label, body }: BooleanConfig) {
    super("boolean", {
      ...body,
      label,
    });
  }
}
