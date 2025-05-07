import type { FieldCreateSchema } from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import Validators from "../Validators/Validators";
import { generateDatoApiKey } from "../utils/utils";

type FieldType = Pick<FieldCreateSchema, "field_type">["field_type"];

export type FieldBody = Omit<FieldCreateSchema, "field_type" | "api_key"> & {
  api_key?: string;
};

export default abstract class Field {
  readonly body: FieldCreateSchema;

  protected constructor(type: FieldType, body: FieldBody) {
    const apiKey = body.api_key || generateDatoApiKey({ name: body.label });

    this.body = {
      ...body,
      field_type: type,
      api_key: apiKey,
      validators: new Validators(body.validators).build(),
    };
  }

  public build() {
    return this.body;
  }
}
