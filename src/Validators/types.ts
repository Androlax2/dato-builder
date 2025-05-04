export interface Validator {
    key: string;

    build(): object | undefined;
}
