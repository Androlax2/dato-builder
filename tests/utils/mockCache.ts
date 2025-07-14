import { jest } from "@jest/globals";
import type { CacheManager } from "../../src/cache/CacheManager";

export function createMockCache(): jest.Mocked<CacheManager> {
  const mock = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    size: jest.fn().mockReturnValue(0),
  } as unknown as jest.Mocked<CacheManager>;

  return mock;
}
