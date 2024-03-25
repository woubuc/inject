import type { Class } from 'type-fest';
import type { Token } from '../token.js';
import type { InjectableConfig } from './injectable-config.js';

/**
 * Global injectable registry
 *
 * @internal
 */
export const registry = new Map<Token<any>, InjectableConfig<any> & { Class: Class<any> }>();
