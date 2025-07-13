import { jest } from "@jest/globals";
import type { ConsoleLogger } from "@/logger";

export function createMockLogger(): jest.Mocked<ConsoleLogger> {
  const mock = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    success: jest.fn(),
    json: jest.fn(),
    debugJson: jest.fn(),
    infoJson: jest.fn(),
    errorJson: jest.fn(),
    traceJson: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn().mockReturnValue(undefined),
    progress: jest.fn(),
    banner: jest.fn(),
    table: jest.fn(),
    group: jest.fn(),
    groupEnd: jest.fn(),
    setLevel: jest.fn(),
    operation: jest.fn().mockReturnThis(), // returns the logger itself
    item: jest.fn().mockReturnThis(),
    child: jest.fn().mockImplementation(() => mock), // allows chaining
  } as unknown as jest.Mocked<ConsoleLogger>;

  return mock;
}
