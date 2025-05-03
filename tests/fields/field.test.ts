import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import Field, {type FieldBody} from "../../src/Fields/Field";
import * as utils from "../../src/utils/utils";

jest.mock("../../src/utils/utils", () => ({
    generateDatoApiKey: jest.fn(
        (label: string) => `mocked_${label.toLowerCase().replace(/\s+/g, "_")}`,
    ),
}));

jest.mock("../../src/Validators/Validators", () => ({
    __esModule: true,
    default: class MockValidators {
        // biome-ignore lint/suspicious/noExplicitAny: It's a mock class
        validators: any;

        // biome-ignore lint/suspicious/noExplicitAny: It's a mock class
        constructor(validators: any) {
            this.validators = validators;
        }

        build() {
            return this.validators ? {...this.validators} : {};
        }
    },
}));

// Create a test subclass of Field for testing the abstract base class
class TestField extends Field {
    constructor(body: FieldBody) {
        // biome-ignore lint/suspicious/noExplicitAny: It's a test
        super("test_type" as any, body);
    }
}

describe("Field", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a field with the provided type and body", () => {
        const testField = new TestField({
            label: "Test Field",
        });

        expect(testField.build()).toEqual({
            label: "Test Field",
            field_type: "test_type",
            api_key: "mocked_test_field",
            validators: {},
        });
    });

    it("should use the provided api_key if present", () => {
        const testField = new TestField({
            label: "Test Field",
            api_key: "custom_api_key",
        });

        expect(testField.build().api_key).toBe("custom_api_key");
        expect(utils.generateDatoApiKey).not.toHaveBeenCalled();
    });

    it("should generate an api_key if not provided", () => {
        const testField = new TestField({
            label: "Test Field",
        });

        expect(utils.generateDatoApiKey).toHaveBeenCalledWith("Test Field");
        expect(testField.build().api_key).toBe("mocked_test_field");
    });

    it("should pass validators to the Validators class", () => {
        const validators = {required: true};
        const testField = new TestField({
            label: "Test Field",
            validators,
        });

        expect(testField.build().validators).toEqual(validators);
    });

    it("should preserve additional properties from the body", () => {
        const testField = new TestField({
            label: "Test Field",
            hint: "This is a hint",
            appearance: {
                type: "custom",
                editor: "",
                parameters: {},
                addons: [],
            },
            position: 1,
        });

        expect(testField.build()).toEqual({
            label: "Test Field",
            field_type: "test_type",
            api_key: "mocked_test_field",
            hint: "This is a hint",
            appearance: {type: "custom", editor: "", parameters: {}, addons: []},
            position: 1,
            validators: {},
        });
    });
});
