import { AsyncLocalStorage } from 'node:async_hooks';
import type { Promisable } from 'type-fest';
import { DependencyTrace } from './dependency-trace.js';
import { CircularDependencyError } from './errors/circular-dependency-error.js';
import { DuplicateTokenError } from './errors/duplicate-token-error.js';
import { MissingTokenError } from './errors/missing-token-error.js';
import { registry } from './injectables/registry.js';
import type { Token } from './token.js';

/**
 * A dependency injection container
 */
export class Container {
	/**
	 * The default container
	 */
	private static readonly root = new Container('root');

	/**
	 * An async store to keep track of the current container
	 */
	private static currentContainerStorage = new AsyncLocalStorage<Container>();

	/**
	 * Returns the current container
	 */
	public static current(): Container {
		return this.currentContainerStorage.getStore() ?? this.root;
	}

	/**
	 * Constructed injectable instances in this container
	 */
	private instances = new Map<Token<any>, any>();

	/**
	 * Initialises a new container
	 *
	 * @param name - Name of the container, for error handling
	 * @param parent - The parent container
	 */
	private constructor(
		private readonly name: string,
		private readonly parent?: Container,
	) {}

	/**
	 * Runs a function in a new child scope of the current container
	 *
	 * @param name - Name of the scope, for error handling
	 * @param run - The function to run in the child scope
	 *
	 * @returns The returned value of the run function
	 */
	public async scoped<T>(name: string, run: () => Promisable<T>): Promise<T> {
		// We create a new container and then use the async storage to set our
		// new container as the current container in the async storage.
		let scopedContainer = new Container(`${ this.name }➤${ name }`, this);
		let result = await Container.currentContainerStorage.run(scopedContainer, run);

		// After running the function, we need to clear the container so the
		// injectable instance destructors can run.
		scopedContainer.clear();

		return result;
	}

	/**
	 * Gets an injectable available in the current scope
	 *
	 * Will check the current container and every parent container one by one,
	 * going up until a matching injectable is found. If none is found, either
	 * a new instance of the requested injectable is constructed in the local
	 * scope (if given a class constructor), or an error is thrown.
	 *
	 * @returns A matching injectable in the current scope
	 *
	 * @throws MissingTokenError if no matching injectable is found and no
	 *                           injectable can be constructed for the given token
	 * @throws CircularDependencyError if a circular dependency is discovered
	 *                                 in the current resolution chain
	 */
	public get<T>(token: Token<T>): T {
		// Try & get an existing instance
		let instance = this.tryGet(token);

		// If no injectable instance was found, we construct a new instance in
		// the current container.
		if (instance == undefined) {
			instance = this.constructInstance(token);
		}

		return instance;
	}

	/**
	 * Attempts to get an instance from this container or a parent container
	 *
	 * @returns A matching injectable in the current scope, or `undefined` if
	 *          no matching injectable is found.
	 */
	public tryGet<T>(token: Token<T>): T | undefined {
		// First try to get an instance from the current container
		return this.instances.get(token)
			?? this.parent?.tryGet(token);
	}

	/**
	 * Provides a value for a given injection token
	 *
	 * This can be used to provide data that isn't a class, like configuration
	 * values.
	 *
	 * @param token - Token to override
	 * @param instance - The instance
	 *
	 * @throws DuplicateTokenError when trying to provide a value for a token
	 *                             that already exists in this container
	 *
	 * @returns The container instance, for chaining
	 */
	public provide<T>(token: Token<T>, instance: T): Container {
		// You can't provide a value for tokens that already exist
		if (this.instances.has(token)) {
			throw new DuplicateTokenError(this.name, token);
		}

		// You can't provide `undefined` as a value
		if (instance === undefined) {
			throw new TypeError('Cannot `provide` with an undefined value');
		}

		this.instances.set(token, instance);

		return this;
	}

	/**
	 * Constructs an instance of the given injectable, tracing the dependency
	 * path to prevent circular dependencies
	 *
	 * @throws MissingTokenError
	 * @throws CircularDependencyError
	 */
	private constructInstance<T>(token: Token<T>): T {
		try {
			return DependencyTrace.with(token.toString(), () => {
				let config = registry.get(token);
				if (config == undefined) {
					throw new MissingTokenError(this.name, token);
				}

				let instance = new config.Class();
				if (config.root) {
					Container.root.instances.set(token, instance);
				} else {
					this.instances.set(token, instance);
				}
				return instance;
			});
		} catch (err) {
			if (err instanceof CircularDependencyError) {
				err.container = this.name;
			}

			throw err;
		}
	}

	/**
	 * Removes all instanced injectables in this container
	 */
	private clear() {
		// Before removing the instances outright, we run the destructors
		// of all applicable instances in this container.
		for (let instance of this.instances.values()) {
			if ('onDestroy' in instance && typeof instance['onDestroy'] === 'function') {
				instance['onDestroy']();
			}
		}

		this.instances.clear();
	}
}
