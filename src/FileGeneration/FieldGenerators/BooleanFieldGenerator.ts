import type { MethodNameToConfig } from "@/types/ItemTypeBuilderFields";
import { FieldGenerator } from "./FieldGenerator";

export class BooleanFieldGenerator extends FieldGenerator<"addBoolean"> {
  getMethodCallName() {
    return "addBoolean" as const;
  }

  generateBuildConfig(): MethodNameToConfig<"addBoolean"> {
    const config = this.createBaseConfig();
    const body = this.createBaseBody();

    this.addHintToBody(body);
    this.addDefaultValueToBody(body);

    return {
      ...config,
      ...(this.hasBodyContent(body) && { body }),
    };
  }
}
