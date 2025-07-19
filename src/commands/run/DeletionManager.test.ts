import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createMockCache } from "@tests/utils/mockCache";
import { createMockLogger } from "@tests/utils/mockLogger";
import type DatoApi from "../../Api/DatoApi";
import type { DeletionCandidate, DeletionSummary } from "./DeletionDetector";
import { DeletionManager } from "./DeletionManager";

// Mock inquirer
jest.mock("inquirer", () => ({
  prompt: jest.fn(),
}));

// Mock dependencies
const mockApi = {
  call: jest.fn(),
  client: {
    itemTypes: {
      destroy: jest.fn(),
    },
  },
} as unknown as jest.Mocked<DatoApi>;

const mockCacheManager = createMockCache();
const mockLogger = createMockLogger();

describe("DeletionManager", () => {
  let deletionManager: DeletionManager;

  beforeEach(() => {
    deletionManager = new DeletionManager(
      mockApi,
      mockCacheManager,
      mockLogger,
    );
    jest.clearAllMocks();
  });

  describe("displayDeletionSummary", () => {
    it("should display message when no items to delete", () => {
      const summary: DeletionSummary = {
        blocks: [],
        models: [],
        total: 0,
      };

      deletionManager.displayDeletionSummary(summary);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "No items to delete - all files match the cache.",
      );
    });

    it("should display deletion summary with blocks and models", () => {
      const summary: DeletionSummary = {
        blocks: [
          {
            key: "block:block1",
            type: "block",
            name: "block1",
            id: "id1",
            hash: "hash1",
          },
        ],
        models: [
          {
            key: "model:model1",
            type: "model",
            name: "model1",
            id: "id2",
            hash: "hash2",
          },
        ],
        total: 2,
      };

      deletionManager.displayDeletionSummary(summary);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "\n  Found 2 item(s) to delete from DatoCMS:",
      );
      expect(mockLogger.info).toHaveBeenCalledWith("\n Blocks (1):");
      expect(mockLogger.info).toHaveBeenCalledWith("  - block1 (id1)");
      expect(mockLogger.info).toHaveBeenCalledWith("\n Models (1):");
      expect(mockLogger.info).toHaveBeenCalledWith("  - model1 (id2)");
    });
  });

  describe("displayUnsafeDeletions", () => {
    it("should not display anything when no unsafe deletions", () => {
      const unsafe: Array<DeletionCandidate & { usedBy: string[] }> = [];

      deletionManager.displayUnsafeDeletions(unsafe);

      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it("should display unsafe deletion warnings", () => {
      const unsafe: Array<DeletionCandidate & { usedBy: string[] }> = [
        {
          key: "block:block1",
          type: "block",
          name: "block1",
          id: "id1",
          hash: "hash1",
          usedBy: ["fileA", "fileB"],
        },
      ];

      deletionManager.displayUnsafeDeletions(unsafe);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "\n  Warning: 1 item(s) cannot be safely deleted as they are still referenced:",
      );
      expect(mockLogger.warn).toHaveBeenCalledWith("  - block: block1");
      expect(mockLogger.warn).toHaveBeenCalledWith("    Used by: fileA, fileB");
    });
  });

  describe("confirmDeletions", () => {
    it("should skip confirmation when skipConfirmation is true", async () => {
      const safe: DeletionCandidate[] = [
        {
          key: "block:block1",
          type: "block",
          name: "block1",
          id: "id1",
          hash: "hash1",
        },
      ];

      const result = await deletionManager.confirmDeletions(safe, {
        skipConfirmation: true,
      });

      expect(result).toBe(safe);
    });

    it("should return empty array when no safe deletions", async () => {
      const safe: DeletionCandidate[] = [];

      const result = await deletionManager.confirmDeletions(safe);

      expect(result).toEqual([]);
    });

    it("should prompt for confirmation when not skipping", async () => {
      const inquirer = require("inquirer");
      const safe: DeletionCandidate[] = [
        {
          key: "block:block1",
          type: "block",
          name: "block1",
          id: "id1",
          hash: "hash1",
        },
      ];

      inquirer.prompt.mockResolvedValueOnce({
        confirmedItems: safe,
      });

      const result = await deletionManager.confirmDeletions(safe);

      expect(result).toBe(safe);
      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "checkbox",
          name: "confirmedItems",
          message: "Select items to delete from DatoCMS:",
          choices: [
            {
              name: "block: block1",
              value: safe[0],
              checked: true,
            },
          ],
        },
      ]);
    });
  });

  describe("deleteCandidates", () => {
    it("should return empty array when no candidates", async () => {
      const result = await deletionManager.deleteCandidates([]);

      expect(result).toEqual([]);
    });

    it("should successfully delete candidates", async () => {
      const candidates: DeletionCandidate[] = [
        {
          key: "block:block1",
          type: "block",
          name: "block1",
          id: "id1",
          hash: "hash1",
        },
      ];

      mockApi.call.mockResolvedValueOnce(undefined);
      mockCacheManager.delete.mockResolvedValueOnce(true);

      const results = await deletionManager.deleteCandidates(candidates);

      expect(results).toEqual([
        {
          success: true,
          candidate: candidates[0],
        },
      ]);

      expect(mockApi.call).toHaveBeenCalledWith(expect.any(Function));
      expect(mockCacheManager.delete).toHaveBeenCalledWith("block:block1");
    });

    it("should handle deletion failures", async () => {
      const candidates: DeletionCandidate[] = [
        {
          key: "block:block1",
          type: "block",
          name: "block1",
          id: "id1",
          hash: "hash1",
        },
      ];

      const error = new Error("Deletion failed");
      mockApi.call.mockRejectedValueOnce(error);

      const results = await deletionManager.deleteCandidates(candidates);

      expect(results).toEqual([
        {
          success: false,
          candidate: candidates[0],
          error,
        },
      ]);
    });
  });

  describe("handleDeletions", () => {
    it("should handle complete deletion flow", async () => {
      const summary: DeletionSummary = {
        blocks: [
          {
            key: "block:block1",
            type: "block",
            name: "block1",
            id: "id1",
            hash: "hash1",
          },
        ],
        models: [],
        total: 1,
      };

      const safe: DeletionCandidate[] = [summary.blocks[0]!];
      const unsafe: Array<DeletionCandidate & { usedBy: string[] }> = [];

      const inquirer = require("inquirer");
      inquirer.prompt.mockResolvedValueOnce({
        confirmedItems: safe,
      });

      mockApi.call.mockResolvedValueOnce(undefined);
      mockCacheManager.delete.mockResolvedValueOnce(true);

      const results = await deletionManager.handleDeletions(
        summary,
        safe,
        unsafe,
      );

      expect(results).toHaveLength(1);
      expect(results[0]?.success).toBe(true);
    });

    it("should handle case when no safe deletions", async () => {
      const summary: DeletionSummary = {
        blocks: [],
        models: [],
        total: 0,
      };

      const safe: DeletionCandidate[] = [];
      const unsafe: Array<DeletionCandidate & { usedBy: string[] }> = [];

      const results = await deletionManager.handleDeletions(
        summary,
        safe,
        unsafe,
      );

      expect(results).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "No items can be safely deleted at this time.",
      );
    });

    it("should handle case when no deletions confirmed", async () => {
      const summary: DeletionSummary = {
        blocks: [
          {
            key: "block:block1",
            type: "block",
            name: "block1",
            id: "id1",
            hash: "hash1",
          },
        ],
        models: [],
        total: 1,
      };

      const safe: DeletionCandidate[] = [summary.blocks[0]!];
      const unsafe: Array<DeletionCandidate & { usedBy: string[] }> = [];

      const inquirer = require("inquirer");
      inquirer.prompt.mockResolvedValueOnce({
        confirmedItems: [],
      });

      const results = await deletionManager.handleDeletions(
        summary,
        safe,
        unsafe,
      );

      expect(results).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "No deletions confirmed. Skipping deletion process.",
      );
    });
  });
});
