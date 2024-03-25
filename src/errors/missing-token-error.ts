import type { Token } from '../token.js';

/**
 * Error thrown when trying to inject from a token that has no associated instance.
 */
export class MissingTokenError extends ReferenceError {
	public constructor(public container: string, public token: Token<any>) {
		super(`Missing token in container ${ container }: ${ token.toString() }.\n Did you forget to provide a value for this token?`);
	}
}
