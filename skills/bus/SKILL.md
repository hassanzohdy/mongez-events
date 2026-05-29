---
name: mongez-events-bus
description: |
  Full API reference for the @mongez/events singleton — subscribe, trigger, triggerAll, async variants, inspect, and direct dispatch.
---
# Events bus

The full API surface of the singleton `events` instance.

## Subscribe

```ts
events.subscribe(event: string, callback: Function): EventSubscription
events.on(event, callback): EventSubscription            // alias
events.addEventListener(event, callback): EventSubscription  // alias
```

Returns:

```ts
type EventSubscription = {
  callback: Function;
  event: string;
  dispatch(...args: any[]): any;        // call the callback directly
  unsubscribe(): void;
};
```

Hold the returned subscription and call `unsubscribe()` when you no longer want the callback.

## Trigger

```ts
events.trigger(event: string, ...args: any[]): any
events.emit(event, ...args): any                   // alias
```

Behavior:

- Calls every callback registered for `event` in subscription order.
- **If a callback returns `false`, the chain stops and `trigger` returns `false`.** Use this for "veto" patterns.
- Otherwise the last non-`undefined` return value is returned.

```ts
events.subscribe("save.before", (data) => {
  if (!isValid(data)) return false;     // vetoes the save
});

const ok = events.trigger("save.before", payload);
if (ok === false) return;
```

## Trigger all (no short-circuit)

```ts
events.triggerAll(event: string, ...args: any[]): EventTriggerResponse

type EventTriggerResponse = {
  event: string;
  length: number;       // number of callbacks invoked
  results: any[];       // all non-undefined return values
};
```

Use when you want every handler to run regardless of return values — analytics, multi-listener notifications, aggregations.

## Async variants

```ts
events.triggerAsync(event, ...args): Promise<any>
events.triggerAllAsync(event, ...args): Promise<EventTriggerResponse>
```

Callbacks are awaited **in subscription order**, not in parallel. If you need parallel dispatch, do it yourself:

```ts
await Promise.all(
  events.subscriptions("flush").map(s => s.dispatch(data)),
);
```

`triggerAsync` also honors the `return false` short-circuit (after awaiting the offending callback).

## Inspect / unsubscribe

```ts
events.subscriptions(event: string): EventSubscription[]
events.unsubscribe(event?: string): this    // detach one event or all
events.off(event?: string): this            // alias
```

Calling `unsubscribe()` with no argument wipes the whole bus. Useful in test teardown.

## Direct dispatch (skip the bus)

The returned `EventSubscription.dispatch(...args)` invokes the callback directly without going through the trigger pipeline. Useful when you want to fire one specific listener without notifying the rest.

```ts
const sub = events.subscribe("ping", (n) => n * 2);
sub.dispatch(21);   // 42
```
