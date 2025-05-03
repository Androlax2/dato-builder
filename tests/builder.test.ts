import {afterEach, beforeEach, describe, expect, it, jest,} from "@jest/globals";
import DatoApi from "../src/Api/DatoApi";
import NotFoundError from "../src/Api/Error/NotFoundError";
import Integer from "../src/Fields/Integer";
import ItemTypeBuilder, {type ItemTypeBuilderConfig,} from "../src/ItemTypeBuilder";
import * as clientModule from "../src/config";
import * as configLoader from "../src/config/loader";

describe("Builder", () => {
    // biome-ignore lint/suspicious/noExplicitAny: any is used for mocking
    let clientMock: any;

    beforeEach(() => {
        // Mock global config loader
        jest.spyOn(configLoader, "loadDatoBuilderConfig").mockReturnValue({
            apiToken: "fake-token",
            overwriteExistingFields: false,
        });

        // Prepare a mock DatoCMS client
        clientMock = {
            itemTypes: {
                create: jest.fn(async (_body) => ({id: "new-id"})),
                update: jest.fn(async () => ({id: "updated-id"})),
                find: jest.fn(),
            },
            fields: {
                list: jest.fn(async () => []),
                create: jest.fn(async () => ({})),
                update: jest.fn(async () => ({})),
                destroy: jest.fn(async () => ({})),
            },
        };

        // Mock getDatoClient to return our fake client
        jest.spyOn(clientModule, "getDatoClient").mockReturnValue(clientMock);

        // Spy on DatoApi.call to directly invoke the passed function
        jest
            .spyOn(DatoApi.prototype, "call")
            // biome-ignore lint/suspicious/noExplicitAny: any is used for mocking
            .mockImplementation(async (fn: any) => fn());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Concrete builder for testing
    class TestBuilder extends ItemTypeBuilder {
        constructor(config?: ItemTypeBuilderConfig) {
            super("model", {name: "TestType"}, config);
        }
    }

    it("create() should call itemTypes.create and return the new id", async () => {
        const builder = new TestBuilder();
        const id = await builder.create();
        expect(clientMock.itemTypes.create).toHaveBeenCalledWith(builder.body);
        expect(id).toBe("new-id");
    });

    it("upsert() should call update when find succeeds", async () => {
        clientMock.itemTypes.find.mockResolvedValue({});
        const builder = new TestBuilder();
        const id = await builder.upsert();
        expect(clientMock.itemTypes.find).toHaveBeenCalledWith(
            builder.body.api_key,
        );
        expect(clientMock.itemTypes.update).toHaveBeenCalledWith(
            builder.body.api_key,
            builder.body,
        );
        expect(id).toBe("updated-id");
    });

    it("upsert() should call create when find throws NotFoundError", async () => {
        clientMock.itemTypes.find.mockRejectedValue(
            new NotFoundError({
                outerCode: "NOT_FOUND",
                innerCode: undefined,
                details: {},
                docUrl: "",
                transient: false,
            }),
        );
        const builder = new TestBuilder();
        const id = await builder.upsert();
        expect(clientMock.itemTypes.create).toHaveBeenCalled();
        expect(id).toBe("new-id");
    });

    it("syncFields should update and destroy when overwriteExistingFields=true", async () => {
        // Prepare existing fields and desired fields
        clientMock.fields.list.mockResolvedValue([
            {api_key: "field1", id: "f1"},
            {api_key: "field2", id: "f2"},
        ]);

        // Subclass to expose sync behavior via create()
        class SyncBuilder extends ItemTypeBuilder {
            constructor() {
                super("model", {name: "SyncType"}, {overwriteExistingFields: true});
                this.addField(
                    new Integer("field1", {
                        position: 1,
                        validators: {required: false, number_range: undefined},
                    }),
                );
            }
        }

        const builder = new SyncBuilder();
        await builder.create(); // triggers syncFields

        // field1 exists -> updated
        expect(clientMock.fields.update).toHaveBeenCalledWith(
            "f1",
            expect.objectContaining({api_key: "field1"}),
        );
        // field2 not desired -> destroyed
        expect(clientMock.fields.destroy).toHaveBeenCalledWith("f2");
    });
});
