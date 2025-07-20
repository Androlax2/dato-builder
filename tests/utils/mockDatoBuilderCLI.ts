import { jest } from "@jest/globals";
import type { DatoBuilderCLI } from "../../src/DatoBuilderCLI";

export function createMockDatoBuilderCLI(): jest.Mocked<DatoBuilderCLI> {
  return {
    build: jest.fn().mockImplementation(async () => {}),
    generate: jest.fn().mockImplementation(async () => {}),
    clearCache: jest.fn().mockImplementation(async () => {}),
  } as unknown as jest.Mocked<DatoBuilderCLI>;
}
