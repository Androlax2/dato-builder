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

export type ItemTypeBuilderConfig = {
    /** When true, existing fields with matching api_key will be updated to match definitions */
    overrideExisting?: boolean;
};

export default abstract class ItemTypeBuilder {
    protected api = new DatoApi(getDatoClient());
    protected readonly client = this.api.client;
    protected readonly body: SimpleSchemaTypes.ItemTypeCreateSchema;
    protected readonly name: string;
    protected readonly type: ItemTypeBuilderType;
    protected readonly fields: Field[] = [];
    protected readonly config: Required<ItemTypeBuilderConfig>;

    protected constructor(
        type: ItemTypeBuilderType,
        body: Omit<SimpleSchemaTypes.ItemTypeCreateSchema, "api_key"> & {
            api_key?: string;
        },
        config: ItemTypeBuilderConfig = {},
    ) {
        this.type = type;
        this.name = body.name;
        this.config = {overrideExisting: config.overrideExisting ?? false};

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

    public setOverrideExisting(value = true): this {
        this.config.overrideExisting = value;
        return this;
    }

    public addField(field: Field): this {
        const key = field.build().api_key;
        if (this.fields.some((f) => f.build().api_key === key)) {
            throw new Error(`Field with api_key "${key}" already exists.`);
        }
        this.fields.push(field);
        return this;
    }

    private getNewFieldPosition(): number {
        return this.fields.length + 1;
    }

    public addInteger(label: string, options?: IntegerBody): this {
        return this.addField(
            new Integer(label, {
                ...options,
                position: options?.position ?? this.getNewFieldPosition(),
            }),
        );
    }

    /**
     * Synchronize fields: create, update (if override), and delete
     *
     * @param itemTypeId ID to sync against
     */
    private async syncFields(itemTypeId: string): Promise<void> {
        const existing = await this.api.call(() =>
            this.client.fields.list(itemTypeId),
        );
        const desired = this.fields.map((f) => f.build());

        // Create new
        const toCreate = desired.filter(
            (d) => !existing.some((e) => e.api_key === d.api_key),
        );
        await Promise.all(
            toCreate.map((d) =>
                this.api.call(() => this.client.fields.create(itemTypeId, d)),
            ),
        );

        if (this.config.overrideExisting) {
            // Update existing fields
            const updates = existing.flatMap((e) => {
                const def = desired.find((d) => d.api_key === e.api_key);
                return def
                    ? [this.api.call(() => this.client.fields.update(e.id, def))]
                    : [];
            });
            await Promise.all(updates);

            // Delete removed
            const toDelete = existing.filter(
                (e) => !desired.some((d) => d.api_key === e.api_key),
            );
            await Promise.all(
                toDelete.map((e) =>
                    this.api.call(() => this.client.fields.destroy(e.id)),
                ),
            );
        }
    }

    public async create(): Promise<string> {
        const item = await this.api.call(() =>
            this.client.itemTypes.create(this.body),
        );
        await this.syncFields(item.id);

        console.info(`Created item type "${this.name}" (id=${item.id})`);

        return item.id;
    }

    public async update(): Promise<string> {
        const item = await this.api.call(() =>
            this.client.itemTypes.update(this.body.api_key, this.body),
        );
        await this.syncFields(item.id);

        console.info(`Updated item type "${this.name}" (id=${item.id})`);

        return item.id;
    }

    public async upsert(): Promise<string> {
        try {
            await this.api.call(() => this.client.itemTypes.find(this.body.api_key));

            return this.update();
        } catch (error: unknown) {
            if (error instanceof NotFoundError) {
                return this.create();
            }

            throw error;
        }
    }
}
