import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type SlugBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<
    ValidatorConfig,
    "required" | "length" | "slug_format" | "slug_title_field" | "unique"
  >;
};

export type SlugConfig = {
  label: string;
  /**
   * A prefix that will be shown in the editor's form to give some context to your editors.
   */
  url_prefix?: string;
  /**
   * A placeholder that will be shown in the editor's input to provide editors with an example.
   */
  placeholder?: string;
  body?: SlugBody;
};

export default class Slug extends Field {
  constructor({ label, url_prefix = "", placeholder = "", body }: SlugConfig) {
    super("slug", {
      ...body,
      label,
      appearance: {
        editor: "slug",
        parameters: {
          url_prefix,
          placeholder,
        },
        addons: body?.addons || [],
      },
    });
  }
}
