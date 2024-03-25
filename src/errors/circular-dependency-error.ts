/**
 * Error thrown when a circular dependency is discovered.
 */
export class CircularDependencyError extends Error {
	public container: string = '<unknown>';

	public override get message(): string {
		return `Circular dependency detected in container ${ this.container }:\n ${ this.path.join('➤') }`
	}

	public constructor(public path: string[]) {
		super();
	}
}
