---
name: mongez-events-overview
description: |
  High-level orientation to the @mongez/events package — what it is, when to use it, and the mental model behind the global bus.
  TRIGGER when: code introduces a first `import events from "@mongez/events"` (or pulls types `EventSubscription`, `EventListeners`, `EventListenersList`, `EventTriggerResponse`); user asks "what is @mongez/events", "when should I use @mongez/events vs @mongez/atom / RxJS / BroadcastChannel", "how do I install @mongez/events", "what's the mental model of the events bus".
  SKIP: concrete API signatures and call semantics — use `mongez-events-bus`; namespace matching rules and bulk cleanup — use `mongez-events-namespaces`; idiomatic recipes (veto, aggregation, React, tests) — use `mongez-events-recipes`; React state coordination questions are usually better answered by `@mongez/react-atom`.
---
# Overview

`@mongez/events` is a tiny, zero-dependency event bus. Subscribe to a named event, trigger it from anywhere, optionally clean up a whole namespace of subscriptions at once.

It's the substrate `@mongez/atom` uses for atom lifecycle events (`atoms.${key}.update`, `…reset`, `…delete`), but it's perfectly usable on its own for any pub/sub flow.

## Install

```sh
yarn add @mongez/events
```

Zero runtime dependencies.

## Import pattern

```ts
import events, {
  type EventSubscription,
  type EventListeners,
  type EventListenersList,
  type EventTriggerResponse,
} from "@mongez/events";
```

## When to reach for this

- You want a process-wide bus to coordinate features without prop-drilling or context.
- You want **namespace-scoped cleanup**: register dozens of listeners under `users.*` and detach them all at once on logout.
- You want **stop-on-`false`** semantics: a single handler can short-circuit the chain.
- You want a minimal dep (no observable libs, no rxjs).

## When NOT to reach for this

- For React component-to-component coordination, prefer `@mongez/react-atom` — atoms with action methods are usually cleaner than ad-hoc events.
- For typed, structured pub/sub with backpressure, use RxJS or a similar reactive library.
- For cross-process / cross-window events, use `BroadcastChannel` or a real message bus.

## Mental model

- **One global bus instance.** `events` is a module-level singleton. All subscribers share it.
- **Events are strings with dot-separated segments.** `users.created`, `cart.checkout`, `atoms.userAtom.update`.
- **Namespaces are event-name prefixes** that match at segment boundaries. Cleanup by namespace wipes a whole subtree without touching unrelated events.
- **Subscriptions return an object**, not an unsubscribe function directly. Hold the returned `EventSubscription` and call `.unsubscribe()` when done.
