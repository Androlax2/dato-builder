import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import type { CacheManager } from '@/cache/CacheManager';
import type { ConsoleLogger } from '@/logger';
import type { BuilderContext } from '@/types/BuilderContext';
import {createMockCache} from "@tests/utils/mockCache";
import {createMockLogger} from "@tests/utils/mockLogger";
import {createMockConfig} from "@tests/utils/mockConfig";
import {ItemBuilder, ItemBuildError} from "@/commands/run/ItemBuilder";
import {FileInfo} from "@/commands/run/types";

// Mock the imported modules
jest.mock('@/BlockBuilder');
jest.mock('@/ModelBuilder');

// Mock implementations
const mockBlockBuilder = {
    constructor: { name: 'BlockBuilder' },
    upsert: jest.fn(),
    getHash: jest.fn(),
};

const mockModelBuilder = {
    constructor: { name: 'ModelBuilder' },
    upsert: jest.fn(),
    getHash: jest.fn(),
};

const mockCache =  createMockCache();
const mockLogger = createMockLogger();
const mockConfig = createMockConfig()
const mockContext: BuilderContext = {
    config: mockConfig,
    getBlock: jest.fn<(name: string) => Promise<string>>(),
    getModel: jest.fn<(name: string) => Promise<string>>(),
};
const mockGetContext = jest.fn<() => BuilderContext>().mockReturnValue(mockContext);

describe('ItemBuilder', () => {
    let itemBuilder: ItemBuilder;
    let originalImport: any;

    beforeEach(() => {
        jest.clearAllMocks();
        itemBuilder = new ItemBuilder(mockCache, mockLogger, mockGetContext);

        // Store original import function
        originalImport = (globalThis as any).import;

        // Mock dynamic import
        (globalThis as any).import = jest.fn() as any;
    });

    afterEach(() => {
        // Restore original import
        (globalThis as any).import = originalImport;
    });

    describe('buildItem', () => {
        const blockFileInfo: FileInfo = {
            type: 'block',
            name: 'testBlock',
            filePath: '/path/to/block.ts',
            dependencies: new Set(['dep1', 'dep2']),
        };

        const modelFileInfo: FileInfo = {
            type: 'model',
            name: 'testModel',
            filePath: '/path/to/model.ts',
            dependencies: new Set(['dep3']),
        };

        it('should return cached result when cache hit occurs', async () => {
            const cachedId = 'cached-id-123';
            const cachedHash = 'cached-hash-456';

            mockCache.get.mockReturnValue({ id: cachedId, hash: cachedHash });
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(mockBlockBuilder),
            });
            mockBlockBuilder.getHash.mockReturnValue(cachedHash);

            const result = await itemBuilder.buildItem(blockFileInfo);

            expect(result).toEqual({ id: cachedId, fromCache: true });
            expect(mockCache.get).toHaveBeenCalledWith('block:testBlock');
            expect(mockBlockBuilder.upsert).not.toHaveBeenCalled();
        });

        it('should build from source when cache miss occurs', async () => {
            const newId = 'new-id-789';
            const newHash = 'new-hash-abc';

            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(mockBlockBuilder),
            });
            mockBlockBuilder.upsert.mockResolvedValue(newId);
            mockBlockBuilder.getHash.mockReturnValue(newHash);

            const result = await itemBuilder.buildItem(blockFileInfo);

            expect(result).toEqual({ id: newId, fromCache: false });
            expect(mockBlockBuilder.upsert).toHaveBeenCalled();
            expect(mockCache.set).toHaveBeenCalledWith('block:testBlock', { id: newId, hash: newHash });
        });

        it('should build from source when cache hash mismatch occurs', async () => {
            const cachedId = 'cached-id-123';
            const cachedHash = 'old-hash-456';
            const newId = 'new-id-789';
            const newHash = 'new-hash-abc';

            mockCache.get.mockReturnValue({ id: cachedId, hash: cachedHash });
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(mockBlockBuilder),
            });
            mockBlockBuilder.getHash.mockReturnValue(newHash);
            mockBlockBuilder.upsert.mockResolvedValue(newId);

            const result = await itemBuilder.buildItem(blockFileInfo);

            expect(result).toEqual({ id: newId, fromCache: false });
            expect(mockBlockBuilder.upsert).toHaveBeenCalled();
            expect(mockCache.set).toHaveBeenCalledWith('block:testBlock', { id: newId, hash: newHash });
        });

        it('should handle model type correctly', async () => {
            const modelId = 'model-id-123';
            const modelHash = 'model-hash-456';

            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(mockModelBuilder),
            });
            mockModelBuilder.upsert.mockResolvedValue(modelId);
            mockModelBuilder.getHash.mockReturnValue(modelHash);

            const result = await itemBuilder.buildItem(modelFileInfo);

            expect(result).toEqual({ id: modelId, fromCache: false });
            expect(mockModelBuilder.upsert).toHaveBeenCalled();
            expect(mockCache.set).toHaveBeenCalledWith('model:testModel', { id: modelId, hash: modelHash });
        });

        it('should throw ItemBuildError when build fails', async () => {
            const error = new Error('Build failed');

            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(mockBlockBuilder),
            });
            mockBlockBuilder.upsert.mockRejectedValue(error);

            await expect(itemBuilder.buildItem(blockFileInfo)).rejects.toThrow(ItemBuildError);

            try {
                await itemBuilder.buildItem(blockFileInfo);
            } catch (e) {
                expect(e).toBeInstanceOf(ItemBuildError);
                expect((e as ItemBuildError).message).toBe('Failed to build block "testBlock": Build failed');
                expect((e as ItemBuildError).itemType).toBe('block');
                expect((e as ItemBuildError).itemName).toBe('testBlock');
                expect((e as ItemBuildError).cause).toBe(error);
            }
        });

        it('should throw ItemBuildError when module does not export default function', async () => {
            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: 'not a function',
            });

            await expect(itemBuilder.buildItem(blockFileInfo)).rejects.toThrow(ItemBuildError);

            try {
                await itemBuilder.buildItem(blockFileInfo);
            } catch (e) {
                expect(e).toBeInstanceOf(ItemBuildError);
                expect((e as ItemBuildError).message).toContain('block "testBlock" does not export a default function');
            }
        });

        it('should throw ItemBuildError when builder is not valid for block type', async () => {
            const invalidBuilder = {
                constructor: { name: 'InvalidBuilder' },
                upsert: jest.fn(),
            };

            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(invalidBuilder),
            });

            await expect(itemBuilder.buildItem(blockFileInfo)).rejects.toThrow(ItemBuildError);

            try {
                await itemBuilder.buildItem(blockFileInfo);
            } catch (e) {
                expect(e).toBeInstanceOf(ItemBuildError);
                expect((e as ItemBuildError).message).toContain('Block "testBlock" must return an instance of BlockBuilder');
            }
        });

        it('should throw ItemBuildError when builder is not valid for model type', async () => {
            const invalidBuilder = {
                constructor: { name: 'InvalidBuilder' },
                upsert: jest.fn(),
            };

            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(invalidBuilder),
            });

            await expect(itemBuilder.buildItem(modelFileInfo)).rejects.toThrow(ItemBuildError);

            try {
                await itemBuilder.buildItem(modelFileInfo);
            } catch (e) {
                expect(e).toBeInstanceOf(ItemBuildError);
                expect((e as ItemBuildError).message).toContain('Model "testModel" must return an instance of ModelBuilder');
            }
        });

        it('should throw ItemBuildError when builder is not an object', async () => {
            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(null),
            });

            await expect(itemBuilder.buildItem(blockFileInfo)).rejects.toThrow(ItemBuildError);

            try {
                await itemBuilder.buildItem(blockFileInfo);
            } catch (e) {
                expect(e).toBeInstanceOf(ItemBuildError);
                expect((e as ItemBuildError).message).toContain('Block "testBlock" must return a builder instance');
            }
        });

        it('should cache modules to avoid repeated imports', async () => {
            const newId = 'new-id-789';
            const newHash = 'new-hash-abc';

            mockCache.get.mockReturnValue(undefined);
            const mockModule = {
                default: jest.fn().mockResolvedValue(mockBlockBuilder),
            };
            ((globalThis as any).import as jest.Mock).mockResolvedValue(mockModule);
            mockBlockBuilder.upsert.mockResolvedValue(newId);
            mockBlockBuilder.getHash.mockReturnValue(newHash);

            // Build the same item twice
            await itemBuilder.buildItem(blockFileInfo);
            await itemBuilder.buildItem(blockFileInfo);

            // Import should only be called once due to caching
            expect((globalThis as any).import).toHaveBeenCalledTimes(1);
            expect((globalThis as any).import).toHaveBeenCalledWith('/path/to/block.ts');
        });

        it('should cache hashes to avoid recomputation', async () => {
            const cachedId = 'cached-id-123';
            const cachedHash = 'cached-hash-456';

            mockCache.get.mockReturnValue({ id: cachedId, hash: cachedHash });
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(mockBlockBuilder),
            });
            mockBlockBuilder.getHash.mockReturnValue(cachedHash);

            // Build the same item twice
            await itemBuilder.buildItem(blockFileInfo);
            await itemBuilder.buildItem(blockFileInfo);

            // getHash should only be called once due to caching
            expect(mockBlockBuilder.getHash).toHaveBeenCalledTimes(1);
        });

        it('should handle cache verification errors gracefully', async () => {
            const newId = 'new-id-789';
            const newHash = 'new-hash-abc';

            mockCache.get.mockReturnValue({ id: 'cached-id', hash: 'cached-hash' });
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(mockBlockBuilder),
            });
            mockBlockBuilder.getHash.mockImplementationOnce(() => {
                throw new Error('Hash computation failed');
            });
            mockBlockBuilder.getHash.mockReturnValue(newHash);
            mockBlockBuilder.upsert.mockResolvedValue(newId);

            const result = await itemBuilder.buildItem(blockFileInfo);

            // Should fall back to building from source
            expect(result).toEqual({ id: newId, fromCache: false });
            expect(mockBlockBuilder.upsert).toHaveBeenCalled();
        });

        it('should pass correct context to build function', async () => {
            const newId = 'new-id-789';
            const newHash = 'new-hash-abc';
            const mockBuildFunction = jest.fn().mockResolvedValue(mockBlockBuilder);

            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: mockBuildFunction,
            });
            mockBlockBuilder.upsert.mockResolvedValue(newId);
            mockBlockBuilder.getHash.mockReturnValue(newHash);

            await itemBuilder.buildItem(blockFileInfo);

            expect(mockBuildFunction).toHaveBeenCalledWith(mockContext);
            expect(mockGetContext).toHaveBeenCalled();
        });

        it('should validate builder has required upsert method', async () => {
            const invalidBuilder = {
                constructor: { name: 'BlockBuilder' },
                // Missing upsert method
            };

            mockCache.get.mockReturnValue(undefined);
            // @ts-ignore
            ((globalThis as any).import as jest.Mock).mockResolvedValue({
                default: jest.fn().mockResolvedValue(invalidBuilder),
            });

            await expect(itemBuilder.buildItem(blockFileInfo)).rejects.toThrow(ItemBuildError);

            try {
                await itemBuilder.buildItem(blockFileInfo);
            } catch (e) {
                expect(e).toBeInstanceOf(ItemBuildError);
                expect((e as ItemBuildError).message).toContain('Block "testBlock" must return an instance of BlockBuilder');
            }
        });
    });

    describe('ItemBuildError', () => {
        it('should create error with correct properties', () => {
            const cause = new Error('Original error');
            const error = new ItemBuildError('Test message', 'block', 'testBlock', cause);

            expect(error.message).toBe('Test message');
            expect(error.name).toBe('ItemBuildError');
            expect(error.itemType).toBe('block');
            expect(error.itemName).toBe('testBlock');
            expect(error.cause).toBe(cause);
        });

        it('should create error without cause', () => {
            const error = new ItemBuildError('Test message', 'model', 'testModel');

            expect(error.message).toBe('Test message');
            expect(error.name).toBe('ItemBuildError');
            expect(error.itemType).toBe('model');
            expect(error.itemName).toBe('testModel');
            expect(error.cause).toBeUndefined();
        });

        it('should be instance of Error', () => {
            const error = new ItemBuildError('Test message', 'block', 'testBlock');
            expect(error).toBeInstanceOf(Error);
        });
    });
});