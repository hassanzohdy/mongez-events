---
name: mongez-events-namespaces
description: |
  How dot-separated event namespaces work in @mongez/events — bulk cleanup, bulk query, and segment-boundary matching semantics.
---
# Namespaces

Event names are dot-separated strings. Anything before a `.` segment is a namespace. The bus has bulk-query / bulk-cleanup operations that match by namespace **at segment boundaries** — so `users.1` matches `users.1` and `users.1.updated` but NOT `users.10`.

## API

```ts
events.unsubscribeNamespace(namespace: string): this

events.getByNamespace(namespace: string): { [eventName: string]: EventSubscription[] }
events.getByNamespaceArray(namespace: string): { event: string; subscriptions: EventSubscription[] }[]
```

> The return shapes have internal type aliases (`EventListeners`, `EventListenersList`) inside the source, but they are NOT re-exported from `@mongez/events`. Let TypeScript infer them at the call site, or copy the inline shapes above if you need to name them in your own code.

## Why segment-aware

Naïve prefix matching would treat `users.10` as a child of `users.1`. That's a real bug class — destroying a user-namespaced thing accidentally wipes unrelated user-namespaced things. The implementation is:

```ts
function matchesNamespace(event: string, namespace: string): boolean {
  return event === namespace || event.startsWith(namespace + ".");
}
```

So:

| namespace | matches | doesn't match |
|---|---|---|
| `"users"` | `users`, `users.1`, `users.1.updated` | `usersTable`, `users2` |
| `"users.1"` | `users.1`, `users.1.profile` | `users.10`, `users.11`, `users.100` |
| `"atoms.cart"` | `atoms.cart.update`, `atoms.cart.reset` | `atoms.cartItems.update` |

## Example — feature-scoped cleanup

```ts
// During feature mount:
events.subscribe("users.created", onCreate);
events.subscribe("users.updated", onUpdate);
events.subscribe("users.deleted", onDelete);

// During feature unmount, drop them all in one call:
events.unsubscribeNamespace("users");
```

## Example — inspecting active listeners

```ts
const all = events.getByNamespaceArray("atoms");
console.log(`Atoms bus has ${all.length} events live.`);
for (const { event, subscriptions } of all) {
  console.log(`  ${event}: ${subscriptions.length} subscriber(s)`);
}
```

## Used internally by `@mongez/atom`

Every atom emits under the namespace `atoms.${key}`. Calling `atom.destroy()` runs `events.unsubscribeNamespace(``atoms.${key}``)` — the segment-aware match ensures destroying `users.1` doesn't wipe `users.10`.
