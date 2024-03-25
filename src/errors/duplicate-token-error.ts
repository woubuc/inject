import type { Token } from '../token.js';

/**
 * Error thrown when trying to provide for a token that already has an
 * associated instance in the container.
 */
export class DuplicateTokenError extends ReferenceError {
	public constructor(public container: string, public token: Token<any>) {
		super(`Trying to define a duplicate token in container ${ container }: ${ token.toString() }.`);
	}
}
