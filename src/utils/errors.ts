// Wraps an unexpected error into an object for error handling at the controller level
export function throwUnexpectedAsHttpError(error: any): never {
  const runtimeError: HttpError = {
    status: 500,
    message: (error satisfies Error) ? error.message : error,
  };

  throw runtimeError;
}
