import type { Class } from 'type-fest';
import type { InjectableConfig } from './injectable-config.js';
import { registry } from './registry.js';

/**
 * Decorated an injectable class
 *
 * @param config - Optional injectable configuration
 *
 * @example
 * ```
 * import { injectable } from '@woubuc/inject';
 *
 * @injectable()
 * class MyService {}
 * ```
 */
export function injectable<T>(config: InjectableConfig<T> = {}) {
	return (C: Class<T>) => {
		if (config.token == undefined) {
			config.token = C;
		}

		registry.set(config.token, { ...config, Class: C });
	};
}
