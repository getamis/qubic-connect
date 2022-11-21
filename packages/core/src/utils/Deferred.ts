function noop(): void {
  // noop
}

export class Deferred<T> {
  public promise: Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reject: (reason?: any) => void = noop;
  public resolve: (resolve: T) => void = noop;
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}
