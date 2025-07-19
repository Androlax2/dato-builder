import { jest } from "@jest/globals";
import type { PlopGenerator } from "plop";

export function createMockPlopGenerator(): jest.Mocked<PlopGenerator> {
  return {
    runPrompts: jest.fn().mockImplementation(async () => {}),
    runActions: jest.fn().mockImplementation(async () => {}),
    description: "",
    prompts: [],
    actions: [],
    alias: "",
    defaults: {},
    skip: false,
  } as unknown as jest.Mocked<PlopGenerator>;
}
