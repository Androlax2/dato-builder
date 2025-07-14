import { FieldGenerator } from "@/FileGeneration/FieldGenerators/FieldGenerator";
import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";

export class DateGenerator extends FieldGenerator<"addDate"> {
  getMethodCallName() {
    return "addDate" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addDate"> {
    const body: NonNullable<MethodNameToConfig<"addDate">["body"]> = {
      api_key: this.field.api_key,
      position: this.field.position,
    };

    // Handle validators
    if (
      this.field.validators &&
      Object.keys(this.field.validators).length > 0
    ) {
      const validators: NonNullable<
        MethodNameToConfig<"addDate">["body"]
      >["validators"] = {};

      // Required validator
      if (this.field.validators.required) {
        validators.required = true;
      }

      // Range validator (min and max together)
      if (this.field.validators.range) {
        validators.date_range = {
          min: new Date(
            (this.field.validators.range as { min: string; max: string }).min,
          ),
          max: new Date(
            (this.field.validators.range as { min: string; max: string }).max,
          ),
        };
      }

      // Min date validator
      if (this.field.validators.min_date) {
        validators.date_range = {
          min: new Date(this.field.validators.min_date as string),
        };
      }

      // Max date validator
      if (this.field.validators.max_date) {
        validators.date_range = {
          max: new Date(this.field.validators.max_date as string),
        };
      }

      body.validators = validators;
    }

    // Handle default value
    if (this.field.default_value) {
      body.default_value = this.field.default_value;
    }

    return {
      label: this.field.label,
      body,
    };
  }
}
