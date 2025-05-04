import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type SingleAssetBody = Omit<FieldBody, "label"> & {
  validators?: Pick<
    ValidatorConfig,
    | "required"
    | "file_size"
    | "image_dimensions"
    | "image_aspect_ratio"
    | "extension"
    | "required_alt_title"
  >;
};

export type SingleAssetConfig = {
  label: string;
  body?: SingleAssetBody;
};

export default class SingleAsset extends Field {
  constructor({ label, body }: SingleAssetConfig) {
    super("file", {
      ...body,
      label,
    });
  }
}
