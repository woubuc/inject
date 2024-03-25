import test from 'ava';
import { Container } from './container.js';
import { injectable } from './lib.js';

test('current container', (t) => {
	t.assert(Container.current());
	t.is(Container.current(), Container.current());
});

test('get', (t) => {
	@injectable()
	class Test {}

	let container = Container.current();

	t.assert(container.get(Test) instanceof Test);
	t.is(container.get(Test), container.get(Test));
});

test('provide', (t) => {
	let container = Container.current();

	container.provide('test', 'foo');
	t.is(container.get('test'), 'foo');
});

// TODO test scoped/inheritance, parent lookup, errors
