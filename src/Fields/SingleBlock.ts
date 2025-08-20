import type { ValidatorConfig } from "../Validators/Validators";
import Field, { type FieldBody } from "./Field";

export type SingleBlockBody = Omit<FieldBody, "label" | "validators"> & {
  validators: {
    single_block_blocks: ValidatorConfig["single_block_blocks"];
  } & Pick<ValidatorConfig, "required">;
};

export type SingleBlockConfig = {
  label: string;
  /**
   * The type of the single block.
   *
   * "frameless_single_block" works only if there is a "required" validator.
   * otherwise, it will be treated as "framed_single_block".
   */
  type?: "framed_single_block" | "frameless_single_block";
  /**
   * Whether you want block records collapsed by default or not.
   *
   * Available only for the "framed_single_block" type.
   *
   * @default false
   */
  start_collapsed?: boolean;
  body: SingleBlockBody;
};

export default class SingleBlock extends Field {
  constructor({
    label,
    type = "framed_single_block",
    start_collapsed = false,
    body,
  }: SingleBlockConfig) {
    super("single_block", {
      ...body,
      label,
      appearance: {
        editor: type,
        parameters: {
          start_collapsed:
            type === "framed_single_block" ? start_collapsed : undefined,
        },
        addons: body?.addons || [],
      },
    });
  }
}
