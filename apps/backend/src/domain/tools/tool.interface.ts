import { z } from 'zod';

/**
 * Interface for AI tools following the Strategy pattern.
 * Each tool can have different implementation but same interface.
 */
export interface ITool<TParams = unknown, TResult = unknown> {
  readonly name: string;
  readonly description: string;
  readonly parametersSchema: z.ZodSchema<TParams>;
  execute(params: TParams): Promise<TResult>;
}
