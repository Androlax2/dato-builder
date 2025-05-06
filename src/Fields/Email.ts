import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type EmailBody = Omit<FieldBody, "label" | "validators"> & {
  validators?: Pick<
    ValidatorConfig,
    "required" | "unique" | "length" | "format" | "enum"
  >;
};

export type EmailConfig = {
  label: string;
  body?: EmailBody;
};

export default class Email extends Field {
  constructor({ label, body }: EmailConfig) {
    const formatValidators = body?.validators?.format;

    let format: NonNullable<EmailBody["validators"]>["format"];
    if (formatValidators?.custom_pattern) {
      format = {
        custom_pattern: formatValidators.custom_pattern,
        ...formatValidators,
      };
    } else {
      if (
        formatValidators?.predefined_pattern &&
        formatValidators.predefined_pattern !== "email"
      ) {
        throw new Error(
          "The `predefined_pattern` for the format validator must be 'email' for Email fields.",
        );
      }
      format = {
        predefined_pattern: "email",
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
