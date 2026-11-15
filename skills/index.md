---
description: "A tiny, zero-dependency global event bus for JavaScript and TypeScript: the `events` singleton with `subscribe`/`on`, `trigger`/`emit`, sync and sequential async dispatch, cancellation via `false`, response aggregation, and namespace-scoped listener cleanup. Use for: \"notify independent modules\", \"cancellable before hooks\", \"collect plugin responses\", \"remove listeners under a namespace\". Not this package → reactive state: @mongez/atom; React atom hooks: @mongez/react-atom; DOM event listeners: platform `EventTarget`."
---

# @mongez/events

`@mongez/events` is a module-level event bus: subscribe to a string event, trigger it from any module, and retain the returned subscription to unsubscribe later. Event names can be grouped with dot-separated namespaces such as `cart.checkout` or `users.42.updated`; namespace helpers match whole segments, so `users.1` never catches `users.10`.

## The 80% path

1. Start with `overview.md` for the singleton bus and its event-name model.
2. Subscribe, trigger, await, aggregate, or remove individual listeners with `bus.md`.
3. Bulk-inspect or dispose a feature's listeners with `namespaces.md`.
4. Copy common lifecycle, veto, async, React cleanup, and teardown patterns from `recipes.md`.

## Conventions and pitfalls

- Keep the `EventSubscription` returned by `subscribe`; call its `.unsubscribe()` for one listener, or `events.unsubscribe(event)` for every listener on that exact event.
- `trigger` and `triggerAsync` stop as soon as a listener returns `false`; choose `triggerAll` or `triggerAllAsync` when every listener must run.
- Async dispatch is sequential, not parallel. Use `Promise.all(events.subscriptions(name).map(...))` only when independent handlers may run concurrently.
- `events.unsubscribe()` clears the entire global bus. Prefer `unsubscribeNamespace` for feature teardown so unrelated listeners remain registered.
- This bus is untyped at the event-name and payload boundary; centralize event names and payload conventions in application code when consistency matters.
