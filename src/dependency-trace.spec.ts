import { expect, test } from 'bun:test';
import { DependencyTrace } from './dependency-trace.js';
import { CircularDependencyError } from './errors/circular-dependency-error.js';

test('with', () => {
	expect(DependencyTrace.path).toEqual([]);

	DependencyTrace.with('foo', () => {
		DependencyTrace.with('bar', () => {
			expect(DependencyTrace.path).toEqual(['foo', 'bar']);
		});
	});

	expect(DependencyTrace.path).toEqual([]);
});

test('circular', () => {
	DependencyTrace.with('foo', () => {
		DependencyTrace.with('bar', () => {
			expect(() => DependencyTrace.with('foo', () => {})).toThrowError(CircularDependencyError);
		});
	});
});
