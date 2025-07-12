export interface Validator {
  key: string;

  build(): Promise<object | undefined> | object | undefined;
}
