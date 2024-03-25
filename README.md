# Dependency Injection Container

A simple global dependency injection container

## Basic usage
Simply annotate a service with `@service()` to register it.

Use the `inject()` function to get the singleton instance of the service. The
DI container will **automatically construct** an instance of the injected class
the first time it is injected anywhere.

```ts
import { injectable, inject } from '@woubuc/inject';

@injectable()
class MyService {
  doStuff() {}
}

class OtherService {
  private readonly service = inject(MyService);

  public doStuff() {
    this.service.doStuff();
  }
}
```

### Custom tokens
You can use strings or symbols as injection tokens, instead of classes.

```ts
import { inject, injectable } from '@woubuc/inject';

const token = 'foo';

@injectable({ token })
class MyService {
  doStuff() {}
}

class OtherService {
  private readonly service = inject<MyService>(token);

  public doStuff() {
    this.service.doStuff();
  }
}
```

**Note: always prefer class injection tokens as they are automatically strongly
typed.**

## The DI Container
You can get a reference to the current container with `Container.current()`.
This allows you to do more dynamic things with the container, besides simply
injecting.

### Get (inject)
The simple `inject()` function is actually shorthand for
`Container.current().get()`:

```ts
import { Container, injectable } from '@woubuc/inject';

@injectable()
class MyService {
  doStuff() {}
}

class OtherService {
  private readonly service = Container.current().get(MyService); // The long version

  public doStuff() {
    this.service.doStuff();
  }
}

```

### Provide
Use `provide()` to provide custom data for a given injection token. Combined
with string tokens, this can be used to provide e.g. configuration values.

```ts
import { Container, inject } from '@woubuc/inject';

const urlToken = Symbol('urlToken');

Container.current().provide(urlToken, 'http://example.com/');

class MyApiClientService {
  private readonly url = inject<string>(urlToken);

  public async load() {
    await fetch(this.url);
  }
}
```

#### Example: mocking injectables
You can use `provide()` to provide mock classes for tests.

```ts
// Main app
import { inject, injectable } from '@woubuc/inject';

@injectable()
class ApiService {
  public get() {
    return fetch('http://example.com');
  }
}

@injectable()
class TestableService {
  private api = inject(ApiService);

  public async load() {
    this.api.get(); // Does a fetch request
  }
}

//
// In your tests:
//
import { Container } from './lib.js';

test('my test', (t) => {
  class MockApiService {
    public get() {
      return {}; // Doesn't do a fetch request
    }
  }

  // Provide the mock implementation
  Container.current().provide(ApiService, new MockApiService());

  inject(TestableService).load(); // Doesn't do fetch request when calling api.get()
});
```

### Scoped containers
Use `scoped()` to create a scoped child container and run (async) logic in it.

```ts
import { Container, inject } from '@woubuc/inject';

// Inject (and instantiate) an injectable in the global container
inject(MyService);

// Run some code in a local scoped container
await Container.current().scoped('temp-0', () => {
  // When we ask for the same class, the container will see that an instance
  // of it exists in the parent container (global) and return that instance.
  inject(MyService);

  // When we ask for a class that isn't instantiated yet, a new instance will
  // be created in the current container scope.
  inject(OtherService);
});

// Trying to inject the other service in the global container, even after
// injecting it successfully in the scoped container, will create a new instance
// because the global container has no idea what happened in the scoped container.
inject(OtherService);
```

### Optional injectables
When using `scoped()` and/or `provide()`, sometimes you may have services that
might or might not exist (yet). In that case you can use `injectOptional()` (or
`Container.current().tryGet()`) to return `undefined` if no instance of the
injectable exists yet - instead of constructing a new instance.

```ts
import { Container, injectOptional } from '@woubuc/inject';

const token = 'foo';

injectOptional(token); // undefined

Container.current().provide(token, 'hello world');

injectOptional(token); // 'hello world'
```

## Destructors
If you need to run some cleanup logic when an instance is no longer needed
(particularly useful when working with scoped containers), you can implement the
`OnDestroy` interface.

```ts
import { Container, inject, injectable, type OnDestroy } from '@woubuc/inject';

@injectable()
class MyService implements OnDestroy {
  public constructor() {
    console.log('hello');
  }

  public onDestroy() {
    console.log('bye');
  }
}

await Container.current().scoped('test', () => {
  let service = inject(MyService); // "hello"

  // We're at the end of the scope so the container is deleted
  // and all local injectable instances are cleared.
  // "bye"
});
```
