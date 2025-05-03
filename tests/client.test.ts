import {beforeEach, describe, expect, it, jest} from "@jest/globals";

describe("Dato Client", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it("calls buildClient with apiToken from config and returns instance", () => {
        // biome-ignore lint/suspicious/noExplicitAny: any is used here to mock a client
        const fakeClient = {} as any;

        // Mock loader to return desired config
        jest.doMock("../src/config/loader", () => ({
            loadDatoBuilderConfig: () => ({
                apiToken: "cfg-token",
            }),
        }));

        // Mock datocms buildClient
        const buildMock = jest.fn().mockReturnValue(fakeClient);
        jest.doMock("@datocms/cma-client-node", () => ({
            buildClient: buildMock,
        }));

        const {getDatoClient} = require("../src/config/index");
        const client = getDatoClient();

        expect(buildMock).toHaveBeenCalledWith({apiToken: "cfg-token"});
        expect(client).toBe(fakeClient);
    });
});
