import { jest } from "@jest/globals";

interface MockDatoApiClient {
  itemTypes: {
    create: jest.MockedFunction<(data: any) => Promise<{ id: string }>>;
    update: jest.MockedFunction<
      (id: string, data: any) => Promise<{ id: string }>
    >;
    list: jest.MockedFunction<() => Promise<any[]>>;
    find: jest.MockedFunction<(id: string) => Promise<any>>;
  };
  fields: {
    list: jest.MockedFunction<(itemTypeId: string) => Promise<any[]>>;
    create: jest.MockedFunction<
      (itemTypeId: string, data: any) => Promise<{ id: string }>
    >;
    update: jest.MockedFunction<
      (id: string, data: any) => Promise<{ id: string }>
    >;
    destroy: jest.MockedFunction<(id: string) => Promise<any>>;
  };
}

interface MockDatoApi {
  client: MockDatoApiClient;
  call: jest.MockedFunction<(fn: () => Promise<unknown>) => Promise<unknown>>;
}

export function createMockDatoApi(): MockDatoApi {
  return {
    client: {
      itemTypes: {
        create: jest
          .fn<(data: any) => Promise<{ id: string }>>()
          .mockResolvedValue({ id: "item-123" }),
        update: jest
          .fn<(id: string, data: any) => Promise<{ id: string }>>()
          .mockResolvedValue({ id: "item-123" }),
        list: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
        find: jest
          .fn<(id: string) => Promise<any>>()
          .mockResolvedValue({ id: "item-123" }),
      },
      fields: {
        list: jest
          .fn<(itemTypeId: string) => Promise<any[]>>()
          .mockResolvedValue([]),
        create: jest
          .fn<(itemTypeId: string, data: any) => Promise<{ id: string }>>()
          .mockResolvedValue({ id: "field-123" }),
        update: jest
          .fn<(id: string, data: any) => Promise<{ id: string }>>()
          .mockResolvedValue({ id: "field-123" }),
        destroy: jest.fn<(id: string) => Promise<any>>().mockResolvedValue({}),
      },
    },
    call: jest
      .fn<(fn: () => Promise<unknown>) => Promise<unknown>>()
      .mockImplementation(async (fn) => fn()),
  };
}

export function createMockBuilder(id: string, hash: string) {
  return {
    upsert: jest.fn<() => Promise<string>>().mockResolvedValue(id),
    getHash: jest.fn<() => string>().mockReturnValue(hash),
    constructor: { name: "BlockBuilder" },
  };
}
