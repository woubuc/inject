import { CircularDependencyError } from './errors/circular-dependency-error.js';

/**
 * Traces dependency paths while injecting & errors when discovering a circular
 * dependency path.
 *
 * @internal
 */
export class DependencyTrace {
	/**
	 * The current path
	 */
	public static path: string[] = [];

	/**
	 * Run a function with a dependency trace
	 *
	 * @param path - The path node to add
	 * @param fn - Function to run
	 */
	public static with<T>(path: string, fn: () => T): T {
		// First we check for circular dependencies with the new path node.
		// If it's already in the current path previously, it means we're
		// going in circles.
		if (this.path.includes(path)) {
			let index = this.path.indexOf(path);
			throw new CircularDependencyError([...this.path.slice(index), path]);
		}

		// Keep track of what the path is now
		let prev = this.path;

		// Set the new path while we run the nested function so that if we
		// start an additional dependency trace from inside the function, it
		// can get the current path from the static property
		this.path = [...this.path, path];

		// Run the function
		let result = fn();

		// The function has completed and everything is fine, so we can go
		// back up & put the previous path value back
		this.path = prev;

		// Lastly, we return the return value of the inner function
		return result;
	}
}
