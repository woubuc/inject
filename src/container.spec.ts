import { expect, test } from 'bun:test';
import { Container } from './container.js';
import { injectable } from './lib.js';

test('current container', () => {
	expect(Container.current()).toBeDefined();
	expect(Container.current()).toStrictEqual(Container.current());
});

test('get', () => {
	@injectable()
	class Test {}

	let container = Container.current();

	expect(container.get(Test)).toBeInstanceOf(Test);
	expect(container.get(Test)).toStrictEqual(container.get(Test));
});

test('provide', () => {
	let container = Container.current();

	container.provide('test', 'foo');
	expect(container.get<string>('test')).toEqual('foo');
});

// TODO test scoped/inheritance, parent lookup, errors
