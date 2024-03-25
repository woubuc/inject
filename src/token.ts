import type { Class } from 'type-fest';

/**
 * A DI injection token
 */
export type Token<T> = Class<T> | string | symbol;
