import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type UrlBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<
    ValidatorConfig,
    "required" | "unique" | "length" | "format" | "enum"
  >;
};

export type UrlConfig = {
  label: string;
  body?: UrlBody;
};

export default class Url extends Field {
  constructor({ label, body }: UrlConfig) {
    const formatValidators = body?.validators?.format;

    let format: NonNullable<UrlBody["validators"]>["format"];
    if (formatValidators?.custom_pattern) {
      format = {
        custom_pattern: formatValidators.custom_pattern,
        ...formatValidators,
      };
    } else {
      if (
        formatValidators?.predefined_pattern &&
        formatValidators.predefined_pattern !== "url"
      ) {
        throw new Error(
          "The `predefined_pattern` for the format validator must be 'url' for Url fields.",
        );
      }
      format = {
        predefined_pattern: "url",
        ...formatValidators,
      };
    }

    super("string", {
      ...body,
      label,
      validators: {
        ...body?.validators,
        format,
      },
    });
  }
}
