import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ConsoleLogger, LogLevel } from "@/logger";

describe("ConsoleLogger", () => {
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger(LogLevel.DEBUG);
    jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("timer memory leak prevention", () => {
    it("should prevent indefinite growth of timers Map to avoid memory leaks", () => {
      const timers = (logger as any).timers as Map<string, number>;

      // Start many timers without ending them - this creates a memory leak
      for (let i = 0; i < 100; i++) {
        logger.time(`abandoned-timer-${i}`);
      }

      // All timers remain in memory indefinitely - this is the security issue
      expect(timers.size).toBe(100);

      expect(() => {
        logger.clearTimers();
      }).not.toThrow();

      // After cleanup, timers should be removed from memory
      expect(timers.size).toBe(0);
    });
  });
});
