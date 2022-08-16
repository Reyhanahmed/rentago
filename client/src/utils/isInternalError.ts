import { InternalError } from "../types";

export function isInternalError(error: unknown): error is InternalError {
  return (error as InternalError).status === "error";
}
