// Shared API result type for all server actions
// DEPRECATED: All types have been consolidated into types/types.ts. Please import from there.
export type ApiResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, unknown> };

// Example usage with satisfies operator (TypeScript 5 best practice):
// const result = { success: true, data: { ... } } satisfies ApiResult<MyType>;
// const errorResult = { success: false, error: "Something went wrong", errors: { ... } } satisfies ApiResult;
