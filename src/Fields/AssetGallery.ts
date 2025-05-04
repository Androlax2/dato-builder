import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field"; //size, file_size, image_dimensions, image_aspect_ratio, extension, required_alt_title

export type AssetGalleryBody = Omit<FieldBody, "label"> & {
  validators?: Pick<
    ValidatorConfig,
    | "size"
    | "file_size"
    | "image_dimensions"
    | "image_aspect_ratio"
    | "extension"
    | "required_alt_title"
  >;
};

export type AssetGalleryConfig = {
  label: string;
  body?: AssetGalleryBody;
};

export default class AssetGallery extends Field {
  constructor({ label, body }: AssetGalleryConfig) {
    super("gallery", {
      ...body,
      label,
    });
  }
}
