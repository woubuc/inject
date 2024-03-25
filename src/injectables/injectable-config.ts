import type { Token } from '../token.js';

export interface InjectableConfig<T> {
	/**
	 * Injection token to use. Defaults to the decorated class constructor.
	 */
	token?: Token<T>;

	/**
	 * If true, will always inject in the root container rather than any child containers.
	 */
	root?: boolean;
}
