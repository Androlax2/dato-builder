import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type LinkBody = Omit<FieldBody, "label"> & {
  validators: {
    item_item_type: ValidatorConfig["item_item_type"];
  } & Pick<ValidatorConfig, "required" | "unique">;
};

export type LinkConfig = {
  label: string;
  body: LinkBody;
};

export default class Link extends Field {
  constructor({ label, body }: LinkConfig) {
    super("link", {
      ...body,
      label,
    });
  }
}
