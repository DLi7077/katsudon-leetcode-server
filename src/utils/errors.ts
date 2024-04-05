export function throwUnexpected(error: any): never {
  const runtimeError: HttpError = {
    status: 500,
    message: (error satisfies Error) ? error.message : error,
  };

  throw runtimeError;
}
