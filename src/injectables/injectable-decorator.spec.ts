import { test, afterEach, expect } from 'bun:test';
import { injectable } from './injectable-decorator.js';
import { registry } from './registry.js';

afterEach(() => {
	registry.clear();
});

test('no token', () => {
	@injectable()
	class Test {}

	expect(registry.get(Test)).toEqual({
		token: Test,
		Class: Test,
	});
});

test('string token', () => {
	@injectable({ token: 'test' })
	class WithStringToken {}

	expect(registry.get('test')).toEqual({
		token: 'test',
		Class: WithStringToken,
	});
});


test('symbol token', () => {
	const symbol = Symbol('test');

	@injectable({ token: symbol })
	class WithSymbolToken {}

	expect(registry.get(symbol)).toEqual({
		token: symbol,
		Class: WithSymbolToken,
	});
});
