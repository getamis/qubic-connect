export class SdkFetchError extends Error {
  constructor(input: { message: string; status: number; statusText: string; body: Record<string, unknown> | null }) {
    super(input.message);
    this.name = 'SdkFetchError';
    this.status = input.status;
    this.statusText = input.statusText;
    this.body = input.body;
    this.stack = new Error().stack;

    // let error instance of SdkFetchError
    Object.setPrototypeOf(this, SdkFetchError.prototype);
  }

  status: number;
  statusText: string;
  body: Record<string, unknown> | null;
}
