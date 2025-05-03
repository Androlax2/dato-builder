import type * as SimpleSchemaTypes from "@datocms/cma-client/src/generated/SimpleSchemaTypes";
import DatoApi from "./Api/DatoApi";
import NotFoundError from "./Api/Error/NotFoundError";
import type Field from "./Fields/Field";
import Integer, {type IntegerBody} from "./Fields/Integer";
import {getDatoClient} from "./config";
import {generateDatoApiKey} from "./utils/utils";

export type ItemTypeBuilderType = "model" | "block";

export type ItemTypeBuilderBody = Omit<
    SimpleSchemaTypes.ItemTypeCreateSchema,
    "api_key" | "modular_block" | "id"
> & {
    api_key?: string;
};

export default abstract class ItemTypeBuilder {
    protected api = new DatoApi(getDatoClient());
    protected readonly body: SimpleSchemaTypes.ItemTypeCreateSchema;
    protected readonly name: string;
    protected readonly type: ItemTypeBuilderType;
    protected readonly fields: Field[] = [];

    protected constructor(
        type: ItemTypeBuilderType,
        body: Omit<SimpleSchemaTypes.ItemTypeCreateSchema, "api_key"> & {
            api_key?: string;
        },
    ) {
        this.type = type;
        this.name = body.name;

        const apiKey =
            body.api_key ||
            generateDatoApiKey(
                body.name,
                this.type === "block" ? "block" : undefined,
            );

        this.body = {
            ...body,
            api_key: apiKey,
            modular_block: this.type === "block",
        };
    }

    public addField(field: Field): this {
        const key = field.build().api_key;
        if (this.fields.some((f) => f.build().api_key === key)) {
            throw new Error(`Field with api_key "${key}" already exists.`);
        }
        this.fields.push(field);
        return this;
    }

    public addInteger(label: string, options?: IntegerBody): this {
        const integerField = new Integer(label, options);
        return this.addField(integerField);
    }

    private async syncFields(itemTypeId: string) {
        const existing = await this.api.call(() =>
            this.api.client.fields.list(itemTypeId),
        );
        const desired = this.fields.map((f) => f.build());

        // Create or update fields
        await Promise.all(
            desired.map((def) => {
                const match = existing.find((e) => e.api_key === def.api_key);
                return this.api.call(() =>
                    match
                        ? this.api.client.fields.update(match.id, def)
                        : this.api.client.fields.create(itemTypeId, def),
                );
            }),
        );

        // Destroy removed fields
        await Promise.all(
            existing
                .filter((e) => !desired.some((d) => d.api_key === e.api_key))
                .map((e) => this.api.call(() => this.api.client.fields.destroy(e.id))),
        );
    }

    public async create(): Promise<string> {
        const itemType = await this.api.call(() =>
            this.api.client.itemTypes.create(this.body),
        );
        await this.syncFields(itemType.id);
        return itemType.id;
    }

    public async update(): Promise<string> {
        const itemType = await this.api.call(() =>
            this.api.client.itemTypes.update(this.body.api_key, this.body),
        );
        await this.syncFields(itemType.id);
        return itemType.id;
    }

    public async upsert(): Promise<string> {
        try {
            await this.api.call(() =>
                this.api.client.itemTypes.find(this.body.api_key),
            );

            return this.update();
        } catch (error: unknown) {
            if (error instanceof NotFoundError) {
                return this.create();
            }

            throw error;
        }
    }
}
