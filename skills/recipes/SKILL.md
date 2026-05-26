---
name: mongez-events-recipes
description: |
  Idiomatic patterns for common @mongez/events use cases — veto hooks, aggregation, async chains, React cleanup, and test teardown.
  TRIGGER when: code combines `events.subscribe` + `events.trigger` / `events.triggerAll` / `events.triggerAsync` into a pattern (veto `return false`, aggregating `results`, sequential vs parallel dispatch via `subscriptions(...).map(s => s.dispatch(...))`, `useEffect` cleanup with `sub.unsubscribe()`, `afterEach(() => events.unsubscribe())`); user asks "how do I implement before/after hooks", "how do I aggregate handler results", "how do I clean up events in React", "how do I reset the bus between tests".
  SKIP: raw single-call API lookup — use `mongez-events-bus`; namespace-matching semantics or bulk cleanup theory — use `mongez-events-namespaces`; package onboarding / install — use `mongez-events-overview`; React state recipes are usually cleaner with `@mongez/react-atom` than raw events.
---
# Recipes

Idiomatic compositions.

## Feature-scoped lifecycle

```ts
function mountUsersFeature() {
  events.subscribe("users.created", onCreate);
  events.subscribe("users.updated", onUpdate);
  events.subscribe("users.deleted", onDelete);
}

function unmountUsersFeature() {
  events.unsubscribeNamespace("users");
}
```

## Veto / "before" hooks

```ts
events.subscribe("save.before", (data) => {
  if (!isValid(data)) return false;
});

events.subscribe("save.before", (data) => {
  if (containsSecrets(data)) return false;
});

const ok = events.trigger("save.before", payload);
if (ok === false) {
  // some hook vetoed it
  return;
}
performSave(payload);
events.trigger("save.after", payload);
```

## Aggregating responses

```ts
// Each plugin contributes a column definition.
events.subscribe("table.columns", () => ({ field: "name",  label: "Name"  }));
events.subscribe("table.columns", () => ({ field: "email", label: "Email" }));

const { results } = events.triggerAll("table.columns");
// results === [{field: "name", ...}, {field: "email", ...}]
```

## Async chains

```ts
events.subscribe("file.uploaded", async (file) => {
  await scanForViruses(file);
});
events.subscribe("file.uploaded", async (file) => {
  await generateThumbnail(file);
});

// Sequential — second handler waits for first to settle.
await events.triggerAsync("file.uploaded", uploaded);
```

For parallel dispatch, use `subscriptions` + `Promise.all`:

```ts
await Promise.all(
  events.subscriptions("file.uploaded").map(s => s.dispatch(uploaded)),
);
```

## Disposable subscriptions in React (without @mongez/react-atom)

```tsx
import events from "@mongez/events";
import { useEffect } from "react";

function Notifications() {
  useEffect(() => {
    const sub = events.subscribe("toast.show", showToast);
    return () => sub.unsubscribe();
  }, []);
  return null;
}
```

If you're already using `@mongez/react-atom`, prefer atoms with `onChange` over raw events — they give you typed state with the same subscribe / unsubscribe ergonomics.

## Test teardown

```ts
import events from "@mongez/events";

afterEach(() => {
  events.unsubscribe();   // wipes the whole bus
});
```

## Debugging — list live subscriptions

```ts
const snapshot = events.getByNamespaceArray("");
// "" is a prefix of every event name, so this returns every subscription.
console.table(snapshot.map(e => ({ event: e.event, count: e.subscriptions.length })));
```

(That works because `getByNamespaceArray("")` matches every event via the
`event === "" || event.startsWith(".")` path, but it's a minor abuse of
the API — for real introspection consider exposing a helper from your
side.)
