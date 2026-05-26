<div align="center">

# @mongez/events

**Tiny, zero-dependency pub/sub bus with dot-segment namespaces, async dispatch, and veto-style short-circuiting — runs anywhere JavaScript runs.**

[![npm](https://img.shields.io/npm/v/@mongez/events.svg)](https://www.npmjs.com/package/@mongez/events)
[![license](https://img.shields.io/npm/l/@mongez/events.svg)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@mongez/events.svg)](https://bundlephobia.com/package/@mongez/events)
[![downloads](https://img.shields.io/npm/dw/@mongez/events.svg)](https://www.npmjs.com/package/@mongez/events)

</div>

---

## Why @mongez/events?

Node's built-in `EventEmitter` is Node-only and gives you nothing on the web. The DOM's `addEventListener` is the opposite — bound to elements and windows, useless for plain feature-to-feature messaging. RxJS solves both but ships an observable runtime an order of magnitude larger than most apps need. `tiny-emitter` is the right size but has no namespace cleanup and no async dispatch.

`@mongez/events` is the smallest layer that does the three things ad-hoc app code actually needs: a single global bus that runs in Node, browser, and SSR; **segment-aware namespace cleanup** (`unsubscribeNamespace("users")` drops every `users.*` listener without false-matching `usersTable`); and **`return false` short-circuits** so a single listener can veto a chain. One source file, zero runtime dependencies.

```ts
import events from "@mongez/events";

const sub = events.subscribe("cart.update", (cart) => {
  console.log("cart now has", cart.totalQuantity, "items");
});

events.trigger("cart.update", { totalQuantity: 3 });

sub.unsubscribe();
```

---

## Features

| Feature | Description |
|---|---|
| **One global bus** | Default export is a module-level singleton — every importer shares the same instance. |
| **Subscribe / trigger** | `subscribe` (aliases `on`, `addEventListener`) + `trigger` (alias `emit`). Synchronous by default. |
| **Veto / short-circuit** | A listener returning `false` stops the chain; `trigger` returns `false`. Use `triggerAll` to opt out. |
| **Async dispatch** | `triggerAsync` / `triggerAllAsync` await callbacks in subscription order — opt into sequential async chains. |
| **Segment-aware namespaces** | `unsubscribeNamespace("users.1")` matches `users.1.updated` but NOT `users.10` or `users.100`. |
| **Inspect handle** | Subscription returns `{ callback, event, dispatch, unsubscribe }` — call `dispatch` to fire one listener directly, `unsubscribe` to detach. |
| **Bulk introspection** | `getByNamespace` / `getByNamespaceArray` list everything alive under a prefix — handy for debugging. |
| **Zero dependencies** | No runtime, no peer deps. Works in Node, browser, SSR, edge. |

---

## Installation

```sh
npm install @mongez/events
```

```sh
yarn add @mongez/events
```

```sh
pnpm add @mongez/events
```

---

## Quick start

```ts
import events from "@mongez/events";

// 1. Subscribe — anywhere, any module.
const sub = events.subscribe("cart.update", (cart, mode) => {
  console.log(mode, cart.totalQuantity);
});

// 2. Trigger — from anywhere else.
events.trigger("cart.update", { totalQuantity: 3 }, "quantityChanged");

// 3. Detach when you're done.
sub.unsubscribe();
```

The default export is a singleton. There is no `new EventBus()` — every import sees the same bus.

---

## Subscribing

```ts
events.subscribe(event: string, callback: Function): EventSubscription
events.on(event, callback): EventSubscription              // alias
events.addEventListener(event, callback): EventSubscription // alias
```

All three are interchangeable; `subscribe` is the underlying method the others delegate to.

The returned `EventSubscription` is your handle on the registration:

```ts
type EventSubscription = {
  callback: Function;                  // the function you passed in
  event: string;                       // the event name
  dispatch: (...args: any[]) => any;   // call the callback directly, bypassing the bus
  unsubscribe: () => void;             // remove this one subscription
};
```

> There is no `off(event, callback)` form. Hold onto the returned subscription and call `unsubscribe()` when you're done — that's the only way to detach a single listener without affecting the rest.

```ts
const headerSub = events.subscribe("header.change", () => {
  console.log("header changed");
});

setTimeout(() => headerSub.unsubscribe(), 3000);
```

---

## Triggering

```ts
events.trigger(event: string, ...args: any[]): any
events.emit(event, ...args): any                    // alias
```

Pass any number of arguments after the event name — every callback gets them in order.

```ts
events.subscribe("cart.update", (cart, mode) => {
  console.log(mode, cart.totalQuantity);
});

events.trigger("cart.update", { totalQuantity: 3 }, "quantityChanged");
```

### Return values

The last non-`undefined` return wins:

```ts
events.on("cart.update", (cart) => {
  if (cart.totalQuantity === 0) return "Empty Cart";
});

events.on("cart.update", (cart) => {
  console.log(cart.totalQuantity);
});

const result = events.trigger("cart.update", { totalQuantity: 0 });
// result === "Empty Cart"  (last non-undefined return)
```

### Veto with `return false`

Any callback returning `false` halts the chain — subsequent listeners are not invoked, and `trigger` itself returns `false`. This is the idiomatic "before-hook" pattern:

```ts
events.subscribe("save.before", (data) => {
  if (!isValid(data)) return false;     // veto
});

events.subscribe("save.before", (data) => {
  if (containsSecrets(data)) return false;
});

const ok = events.trigger("save.before", payload);
if (ok === false) return; // some hook vetoed it
performSave(payload);
```

> `false` is special. Any other falsy value (`0`, `""`, `null`) does NOT short-circuit. If you need a handler to legitimately return `false` without halting the bus, use `triggerAll` instead.

### `triggerAll` — fire every listener, collect every result

```ts
events.triggerAll(event: string, ...args: any[]): EventTriggerResponse

type EventTriggerResponse = {
  event: string;
  length: number;       // how many callbacks ran
  results: any[];       // non-undefined returns, in subscription order
};
```

```ts
events.subscribe("table.columns", () => ({ field: "name",  label: "Name"  }));
events.subscribe("table.columns", () => ({ field: "email", label: "Email" }));

const { results } = events.triggerAll("table.columns");
// results === [{ field: "name", ... }, { field: "email", ... }]
```

Reach for `triggerAll` for analytics fan-out, plugin contribution patterns, or anywhere you need every listener to run regardless of what each returns.

---

## Async dispatch

```ts
events.triggerAsync(event, ...args): Promise<any>
events.triggerAllAsync(event, ...args): Promise<EventTriggerResponse>
```

Callbacks are awaited **sequentially**, in subscription order — each one finishes before the next starts. `triggerAsync` still honors the `return false` short-circuit (after awaiting the offending callback).

```ts
events.subscribe("file.uploaded", async (file) => await scanForViruses(file));
events.subscribe("file.uploaded", async (file) => await generateThumbnail(file));

// Second handler waits for the first to settle.
await events.triggerAsync("file.uploaded", uploaded);
```

For parallel dispatch, walk the subscriptions yourself:

```ts
await Promise.all(
  events.subscriptions("file.uploaded").map((s) => s.dispatch(uploaded)),
);
```

---

## Namespaces

Event names are dot-separated strings — `users.created`, `cart.checkout`, `atoms.userAtom.update`. Anything before a `.` is a namespace, and the bus has bulk operations that match by namespace **at segment boundaries**.

```ts
events.unsubscribeNamespace(namespace: string): this
events.getByNamespace(namespace: string): { [event: string]: EventSubscription[] }
events.getByNamespaceArray(namespace: string): { event: string; subscriptions: EventSubscription[] }[]
```

Internally the match is `event === namespace || event.startsWith(namespace + ".")`. That extra `.` is the whole point — naive prefix matching would treat `users.10` as a child of `users.1`.

| namespace | matches | doesn't match |
|---|---|---|
| `"users"` | `users`, `users.1`, `users.1.updated` | `usersTable`, `users2` |
| `"users.1"` | `users.1`, `users.1.profile` | `users.10`, `users.11`, `users.100` |
| `"atoms.cart"` | `atoms.cart.update`, `atoms.cart.reset` | `atoms.cartItems.update` |

```ts
events.subscribe("users.created", onCreate);
events.subscribe("users.updated", onUpdate);
events.subscribe("users.deleted", onDelete);

// One call drops all three.
events.unsubscribeNamespace("users");
```

> `@mongez/atom` is the canonical user of this. Every atom emits under `atoms.${key}`, and `atom.destroy()` runs `events.unsubscribeNamespace(`atoms.${key}`)` — the segment-aware match ensures destroying `users.1` doesn't wipe `users.10`.

---

## Cleanup

```ts
events.unsubscribe(event?: string): this    // detach one event, or every event when undefined
events.off(event?: string): this            // alias
```

Three levels of teardown:

```ts
sub.unsubscribe();                  // one subscription
events.off("header.change");        // every listener on that event
events.unsubscribeNamespace("users"); // every listener under a namespace
events.unsubscribe();               // every listener on every event (test teardown)
```

> `events.unsubscribe()` with no argument wipes the whole bus. That's almost always what you want in `afterEach` for tests — never in production code.

---

## Inspecting

```ts
events.subscriptions(event: string): EventSubscription[]
```

Returns every subscription currently registered for a single event. Useful for debugging, for `Promise.all` parallel dispatch (above), or for asserting in tests.

```ts
events.subscribe("header.change", () => {});
events.subscribe("header.change", () => {});

events.subscriptions("header.change").length; // 2
```

For multi-event introspection, use `getByNamespaceArray("...")` and walk the result.

---

## Recipes

### Broadcast `user.login` across features

Reach for this when several unrelated features (analytics, header, cart, notifications) all need to react to the same auth event without knowing about each other.

```ts
// src/features/auth/loginFlow.ts
import events from "@mongez/events";

export async function login(credentials: Credentials) {
  const user = await api.login(credentials);
  events.trigger("user.login", user);
  return user;
}
```

```ts
// src/features/analytics/index.ts
import events from "@mongez/events";

events.subscribe("user.login", (user) => {
  analytics.identify(user.id);
  analytics.track("Logged In");
});
```

```ts
// src/features/header/UserBadge.tsx
import events from "@mongez/events";
import { useEffect, useState } from "react";

export function UserBadge() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sub = events.subscribe("user.login", setUser);
    return () => sub.unsubscribe();
  }, []);

  return user ? <span>Hi, {user.name}</span> : null;
}
```

Each feature subscribes and cleans up locally; the login flow stays ignorant of every consumer.

### Cancel a save with veto

Reach for this when you want plugins (or a validation pipeline) to block an action without throwing or wrapping the call in conditionals.

```ts
import events from "@mongez/events";

events.subscribe("post.beforeSave", (post) => {
  if (post.title.length < 3) return false; // veto — too short
});

events.subscribe("post.beforeSave", (post) => {
  if (containsBannedWords(post.body)) return false; // veto — moderation
});

export function savePost(post: Post) {
  const ok = events.trigger("post.beforeSave", post);
  if (ok === false) {
    showToast("Post rejected by a pre-save check.");
    return;
  }

  api.save(post);
  events.trigger("post.afterSave", post);
}
```

Any subscriber can halt the save by returning `false`, and the rest of the chain never runs.

### Mount and unmount a feature with one namespace

Reach for this whenever a feature registers several listeners on boot and needs to drop them all on tear-down — feature flags, lazy-loaded modules, multi-tenant apps.

```ts
import events from "@mongez/events";

export function mountUsersFeature() {
  events.subscribe("users.created", onCreate);
  events.subscribe("users.updated", onUpdate);
  events.subscribe("users.deleted", onDelete);
  events.subscribe("users.exported", onExport);
}

export function unmountUsersFeature() {
  events.unsubscribeNamespace("users"); // drops all four in one call
}
```

> Naming matters here. If you name events `usersCreated` instead of `users.created`, namespace cleanup can't help you — the dot is what the matcher keys off.

### Sequential async pipeline on upload

Reach for this when downstream steps need to observe the output of upstream ones — virus scan must finish before thumbnail generation reads the file.

```ts
import events from "@mongez/events";

events.subscribe("file.uploaded", async (file) => {
  await scanForViruses(file); // must finish first
});

events.subscribe("file.uploaded", async (file) => {
  await generateThumbnail(file); // runs only after the scan resolves
});

events.subscribe("file.uploaded", async (file) => {
  await indexForSearch(file);
});

await events.triggerAsync("file.uploaded", uploadedFile);
```

For independent steps, swap to `Promise.all(events.subscriptions("file.uploaded").map(s => s.dispatch(file)))` for true parallelism.

### Wipe the bus between tests

Reach for this in any test suite that uses the singleton — without teardown, listeners from one test leak into the next.

```ts
import { afterEach } from "vitest";
import events from "@mongez/events";

afterEach(() => {
  events.unsubscribe(); // detach every listener on every event
});

it("logs the user in", async () => {
  const spy = vi.fn();
  events.subscribe("user.login", spy);
  await login(creds);
  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
});
// afterEach runs — bus is clean before the next test.
```

---

## Related packages

| Package | Use when you need |
|---|---|
| [`@mongez/atom`](https://github.com/hassanzohdy/atom) | Reactive state primitive. Every atom emits its lifecycle (`atoms.${key}.update`, `…reset`, `…delete`) through this bus — namespace cleanup on `atom.destroy()` is built on `unsubscribeNamespace`. |
| [`@mongez/cache`](https://github.com/hassanzohdy/mongez-cache) | Synchronous cache facade. Doesn't emit on its own — wrap its `set` / `remove` with `events.trigger` when you need write-through subscriptions (cross-tab sync, analytics, debugging). |
| [`@mongez/react-atom`](https://github.com/hassanzohdy/react-atom) | React bindings on top of `@mongez/atom`. For component-to-component state coordination, prefer atoms over ad-hoc events. |

For the full single-file API surface, see [`llms-full.txt`](./llms-full.txt).

---

## License

MIT
