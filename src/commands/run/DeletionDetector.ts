import type { CacheManager } from "@/cache/CacheManager";
import type { ConsoleLogger } from "@/logger";
import type { FileInfo } from "./types";

export interface DeletionCandidate {
  key: string;
  type: "block" | "model";
  name: string;
  id: string;
  hash: string;
}

export interface DeletionSummary {
  blocks: DeletionCandidate[];
  models: DeletionCandidate[];
  total: number;
}

export class DeletionDetector {
  constructor(
    private readonly cache: CacheManager,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.trace("Initializing DeletionDetector");
  }

  /**
   * Detect items that are in the cache but not on the filesystem.
   */
  public detectDeletions(fileMap: Map<string, FileInfo>): DeletionSummary {
    this.logger.trace("Starting deletion detection");

    const cachedKeys = new Set(this.cache.keys());
    const currentFileKeys = new Set(fileMap.keys());

    this.logger.traceJson("Deletion detection data", {
      cachedKeysCount: cachedKeys.size,
      currentFileKeysCount: currentFileKeys.size,
      cachedKeys: Array.from(cachedKeys),
      currentFileKeys: Array.from(currentFileKeys),
    });

    const deletionCandidates: DeletionCandidate[] = [];

    for (const cacheKey of cachedKeys) {
      if (!currentFileKeys.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          const [type, name] = this.parseCacheKey(cacheKey);
          if (type && name) {
            deletionCandidates.push({
              key: cacheKey,
              type,
              name,
              id: cachedData.id,
              hash: cachedData.hash,
            });

            this.logger.traceJson("Found deletion candidate", {
              key: cacheKey,
              type,
              name,
              id: cachedData.id,
            });
          }
        }
      }
    }

    const blocks = deletionCandidates.filter((item) => item.type === "block");
    const models = deletionCandidates.filter((item) => item.type === "model");

    const summary: DeletionSummary = {
      blocks,
      models,
      total: deletionCandidates.length,
    };

    this.logger.traceJson("Deletion detection completed", {
      totalCandidates: summary.total,
      blocksCount: blocks.length,
      modelsCount: models.length,
    });

    return summary;
  }

  public canSafelyDelete(
    candidate: DeletionCandidate,
    fileMap: Map<string, FileInfo>,
  ): { canDelete: boolean; usedBy: string[] } {
    this.logger.traceJson("Checking if item can be safely deleted", {
      candidate: candidate.key,
      type: candidate.type,
      name: candidate.name,
    });

    const usedBy: string[] = [];

    for (const [fileKey, fileInfo] of fileMap.entries()) {
      if (fileInfo.dependencies.has(candidate.key)) {
        usedBy.push(fileKey);
      }
    }

    const canDelete = usedBy.length === 0;

    this.logger.traceJson("Safety check completed", {
      candidate: candidate.key,
      canDelete,
      usedBy,
    });

    return { canDelete, usedBy };
  }

  public filterSafeDeletions(
    candidates: DeletionCandidate[],
    fileMap: Map<string, FileInfo>,
  ): {
    safe: DeletionCandidate[];
    unsafe: Array<DeletionCandidate & { usedBy: string[] }>;
  } {
    this.logger.trace("Filtering safe deletions");

    const safe: DeletionCandidate[] = [];
    const unsafe: Array<DeletionCandidate & { usedBy: string[] }> = [];

    for (const candidate of candidates) {
      const { canDelete, usedBy } = this.canSafelyDelete(candidate, fileMap);

      if (canDelete) {
        safe.push(candidate);
      } else {
        unsafe.push({ ...candidate, usedBy });
      }
    }

    this.logger.traceJson("Safe deletion filtering completed", {
      totalCandidates: candidates.length,
      safeCount: safe.length,
      unsafeCount: unsafe.length,
    });

    return { safe, unsafe };
  }

  private parseCacheKey(
    key: string,
  ): [type: "block" | "model" | null, name: string | null] {
    const colonIndex = key.indexOf(":");
    if (colonIndex === -1) {
      this.logger.warn(`Invalid cache key format: ${key}`);
      return [null, null];
    }

    const type = key.substring(0, colonIndex);
    const name = key.substring(colonIndex + 1);

    if (type !== "block" && type !== "model") {
      if (type !== "sync") {
        this.logger.warn(`Unknown item type in cache key: ${type}`);
      }
      return [null, null];
    }

    return [type, name];
  }
}
