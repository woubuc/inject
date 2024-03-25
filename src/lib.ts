import { Container } from './container.js';
import type { Token } from './token.js';

// Re-exports
export { Container } from './container.js';
export type { CircularDependencyError } from './errors/circular-dependency-error.js';
export type { MissingTokenError } from './errors/missing-token-error.js';
export { injectable } from './injectables/injectable-decorator.js';
export type { OnDestroy } from './on-destroy.js';
export type { Token } from './token.js';

/**
 * Injects an injectable
 *
 * @see {Container#get}
 */
export function inject<T>(token: Token<T>): T {
	return Container.current().get(token);
}


/**
 * Injects an injectable, or `undefined` if the injectable does not exist in
 * the current injection context
 *
 * @see {Container#tryGet}
 */
export function injectOptional<T>(token: Token<T>): T | undefined {
	return Container.current().tryGet(token);
}
