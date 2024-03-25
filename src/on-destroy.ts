/**
 * You can implement this interface on an injectable (annotated with
 * `@injectable`) to add a destructor function that is ran when the injectable
 * is destroyed.
 *
 * Use a destructor to clean up stray resources or do other housekeeping tasks
 * right before the context is lost in its DI Container.
 *
 * **Note:** the actual in-memory instance is not guaranteed to be destroyed
 * immediately after the destructor is called, as this is dependant on the
 * JS garbage collector. However, after the destructor gets called the
 * injectable will no longer be associated with any DI container and will not
 * be able to be injected.
 */
export interface OnDestroy {
	/**
	 * Called when the injectable is destroyed
	 */
	onDestroy(): void;
}
