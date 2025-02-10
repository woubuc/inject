import type { Class } from 'type-fest';

/**
 * A DI injection token
 */
export type Token<T> = Class<T> | string | symbol;

/**
 * Creates a unique typed injection token.
 * 
 * This function uses a Symbol representation and so will never return equal 
 * tokens when called multiple times, even with the same `name` value.
 * 
 * @param name - Human-readable identifier.
 * 
 * @example
 * ```ts
 * const HOST = token<string>('host');
 * 
 * provide(HOST, 'http://localhost');
 * 
 * let url = inject(HOST) + '/foo';
 * ```
 */
export function token<T>(name: string): Token<T> {
    return Symbol(name);
}
