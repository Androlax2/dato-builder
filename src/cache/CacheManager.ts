import { promises as fs } from "node:fs";
import path from "node:path";

type CacheData = {
  hash: string;
  id: string;
};

interface FileSystemInterface {
  readFile: (path: string, encoding: BufferEncoding) => Promise<string>;
  writeFile: (
    path: string,
    data: string,
    encoding: BufferEncoding,
  ) => Promise<void>;
  mkdir: (
    path: string,
    options: { recursive: boolean },
  ) => Promise<string | undefined>;
}

interface PathInterface {
  dirname: typeof path.dirname;
}

export class CacheManager {
  // biome-ignore lint/nursery/useReadonlyClassProperties: It is not a read-only property.
  private items: Map<string, CacheData>;

  private readonly cachePath: string;
  private readonly skipReads: boolean;
  private readonly fs: FileSystemInterface;
  private readonly path: PathInterface;

  // biome-ignore lint/nursery/useReadonlyClassProperties: It is not a read-only property.
  private writeQueue: Array<{
    data: CacheData;
    resolve: Function;
    reject: Function;
  }> = [];
  private isWriting: boolean = false;
  private processingNeeded: boolean = false;

  constructor(
    cachePath: string,
    options: {
      skipReads?: boolean;
      fs?: FileSystemInterface;
      path?: PathInterface;
    } = {},
  ) {
    this.cachePath = cachePath;
    this.skipReads = options.skipReads || false;
    this.fs = options.fs || fs;
    this.path = options.path || path;
    // Always initialize the Map for in-memory caching
    this.items = new Map();
  }

  /**
   * Initialize the cache by loading existing data from file
   * Skips loading if skipReads is enabled
   */
  async initialize(): Promise<void> {
    // Skip loading from file if skipReads is enabled, but keep in-memory cache
    if (this.skipReads) {
      return;
    }

    try {
      await this.ensureCacheDirectoryExists();
      await this.loadFromFile();
    } catch (_error) {
      // Continue with empty cache if file doesn't exist or is corrupted
      this.items = new Map();
    }
  }

  /**
   * Get an item from the cache
   */
  get(key: string): CacheData | undefined {
    return this.items.get(key);
  }

  /**
   * Set an item in the cache
   */
  async set(key: string, data: CacheData): Promise<void> {
    this.items.set(key, data);
    return this.queueWrite(data);
  }

  /**
   * Check if an item exists in the cache
   */
  has(key: string): boolean {
    return this.items.has(key);
  }

  /**
   * Delete an item from the cache
   */
  async delete(key: string): Promise<boolean> {
    const existed = this.items.delete(key);
    if (existed) {
      await this.persistToFile();
    }
    return existed;
  }

  /**
   * Clear all items from the cache
   */
  async clear(): Promise<void> {
    this.items.clear();
    await this.persistToFile();
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.items.keys());
  }

  /**
   * Get all cache values
   */
  values(): CacheData[] {
    return Array.from(this.items.values());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.items.size;
  }

  /**
   * Get cache entries as array of [key, value] pairs
   */
  entries(): [string, CacheData][] {
    return Array.from(this.items.entries());
  }

  /**
   * Find items by hash
   */
  findByHash(hash: string): CacheData[] {
    return this.values().filter((item) => item.hash === hash);
  }

  /**
   * Find item by id
   */
  findById(id: string): CacheData | undefined {
    return this.values().find((item) => item.id === id);
  }

  /**
   * Check if cache reads are being skipped
   */
  isSkippingReads(): boolean {
    return this.skipReads;
  }

  /**
   * Get actual cache size (always returns current in-memory size)
   */
  getActualSize(): number {
    return this.items.size;
  }

  /**
   * Load cache data from file
   */
  private async loadFromFile(): Promise<void> {
    try {
      const data = await this.fs.readFile(this.cachePath, "utf8");
      const parsed = JSON.parse(data);

      if (Array.isArray(parsed)) {
        // Handle array format: [key, value] pairs
        this.items = new Map(parsed);
      } else if (typeof parsed === "object" && parsed !== null) {
        // Handle object format
        this.items = new Map(Object.entries(parsed));
      } else {
        throw new Error("Invalid cache file format");
      }
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        // File doesn't exist, start with empty cache
        this.items = new Map();
      } else {
        throw error;
      }
    }
  }

  /**
   * Ensure the cache directory exists
   */
  private async ensureCacheDirectoryExists(): Promise<void> {
    const dir = this.path.dirname(this.cachePath);
    await this.fs.mkdir(dir, { recursive: true });
  }

  /**
   * Queue a write operation to avoid concurrent writes
   */
  private async queueWrite(data: CacheData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.writeQueue.push({ data, resolve, reject });
      this.processWriteQueue();
    });
  }

  /**
   * Process the write queue
   */
  private async processWriteQueue(): Promise<void> {
    // If already writing, mark that processing is needed and return
    if (this.isWriting) {
      this.processingNeeded = true;
      return;
    }

    // If queue is empty, clear processing flag and return
    if (this.writeQueue.length === 0) {
      this.processingNeeded = false;
      return;
    }

    this.isWriting = true;

    try {
      await this.persistToFile();

      // Resolve all queued promises
      const queue = [...this.writeQueue];
      this.writeQueue = [];
      for (const { resolve } of queue) {
        resolve();
      }
    } catch (error) {
      // Reject all queued promises
      const queue = [...this.writeQueue];
      this.writeQueue = [];
      for (const { reject } of queue) {
        reject(error);
      }
    } finally {
      this.isWriting = false;

      // Continue processing until queue is empty and no processing is needed
      while (this.writeQueue.length > 0 || this.processingNeeded) {
        this.processingNeeded = false;
        await this.processWriteQueue();
      }
    }
  }

  /**
   * Persist the current cache state to file
   */
  private async persistToFile(): Promise<void> {
    await this.ensureCacheDirectoryExists();

    // Convert Map to array of [key, value] pairs for JSON serialization
    const dataToWrite = Array.from(this.items.entries());

    await this.fs.writeFile(
      this.cachePath,
      JSON.stringify(dataToWrite, null, 2),
      "utf8",
    );
  }
}
