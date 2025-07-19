import { jest } from "@jest/globals";
import type { NodePlopAPI } from "plop";

export function createMockPlop(): jest.Mocked<NodePlopAPI> {
  return {
    setGenerator: jest.fn(),
    getGenerator: jest.fn(),
    getGeneratorList: jest.fn(),
  } as unknown as jest.Mocked<NodePlopAPI>;
}
