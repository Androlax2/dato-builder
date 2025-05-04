import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type SeoBody = Omit<FieldBody, "label"> & {
  validators?: Pick<
    ValidatorConfig,
    | "required_seo_fields"
    | "file_size"
    | "image_dimensions"
    | "image_aspect_ratio"
    | "title_length"
    | "description_length"
  >;
};

export type SeoConfig = {
  label: string;
  /**
   * Specify which fields of the SEO input should be visible to editors.
   *
   * @default ["title", "description", "image", "no_index", "twitter_card"]
   */
  fields?: Array<
    "title" | "description" | "image" | "no_index" | "twitter_card"
  >;
  /**
   * Specify which previews should be visible to editors.
   *
   * @default ["google", "twitter", "slack", "whatsapp", "telegram", "facebook", "linkedin"]
   */
  previews?: Array<
    | "google"
    | "twitter"
    | "slack"
    | "whatsapp"
    | "telegram"
    | "facebook"
    | "linkedin"
  >;
  body?: SeoBody;
};

export default class Seo extends Field {
  constructor({
    label,
    fields = ["title", "description", "image", "no_index", "twitter_card"],
    previews = [
      "google",
      "twitter",
      "slack",
      "whatsapp",
      "telegram",
      "facebook",
      "linkedin",
    ],
    body,
  }: SeoConfig) {
    super("seo", {
      ...body,
      label,
      appearance: {
        editor: "seo",
        parameters: {
          fields,
          previews,
        },
        addons: [],
      },
    });
  }
}
