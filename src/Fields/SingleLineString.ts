import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type SingleLineStringBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<
    ValidatorConfig,
    "required" | "unique" | "length" | "format" | "enum"
  >;
};

export type SingleLineStringOptions = {
  /**
   * Indicates if the field should be shown bigger, as a field representing a heading
   */
  heading?: boolean;
  /**
   * A placeholder that will be shown in the editor's input to provide editors with an example.
   */
  placeholder?: string;
};

export type SingleLineStringConfig = {
  label: string;
  body?: SingleLineStringBody;
  options?: SingleLineStringOptions;
};

export default class SingleLineString extends Field {
  constructor({ label, body, options }: SingleLineStringConfig) {
    super("string", {
      ...body,
      label,
      appearance: {
        editor: "single_line",
        parameters: {
          heading: options?.heading ?? false,
          placeholder: options?.placeholder ?? "",
        },
        addons: body?.addons || [],
      },
    });
  }
}
