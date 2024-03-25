import test from 'ava';
import { DependencyTrace } from './dependency-trace.js';
import { CircularDependencyError } from './errors/circular-dependency-error.js';

test('with', (t) => {
	t.deepEqual(DependencyTrace.path, []);

	DependencyTrace.with('foo', () => {
		DependencyTrace.with('bar', () => {
			t.deepEqual(DependencyTrace.path, ['foo', 'bar']);
		});
	});

	t.deepEqual(DependencyTrace.path, []);
});

test('circular', (t) => {
	DependencyTrace.with('foo', () => {
		DependencyTrace.with('bar', () => {
			t.throws(
				() => DependencyTrace.with('foo', () => {}),
				{ instanceOf: CircularDependencyError },
			);
		});
	});
});
