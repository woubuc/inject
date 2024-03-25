import test from 'ava';
import { injectable } from './injectable-decorator.js';
import { registry } from './registry.js';

test.afterEach(() => {
	registry.clear();
});

test('no token', (t) => {
	@injectable()
	class Test {}

	t.deepEqual(registry.get(Test), {
		token: Test,
		Class: Test,
	});
});

test('string token', (t) => {
	@injectable({ token: 'test' })
	class WithStringToken {}

	t.deepEqual(registry.get('test'), {
		token: 'test',
		Class: WithStringToken,
	});
});


test('symbol token', (t) => {
	const symbol = Symbol('test');

	@injectable({ token: symbol })
	class WithSymbolToken {}

	t.deepEqual(registry.get(symbol), {
		token: symbol,
		Class: WithSymbolToken,
	});
});
