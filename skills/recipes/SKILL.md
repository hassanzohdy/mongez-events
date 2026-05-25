---
name: mongez-events-recipes
description: Idiomatic patterns for common @mongez/events use cases — veto hooks, aggregation, async chains, React cleanup, and test teardown.
when_to_use: User wants a practical example of how to use @mongez/events in a real scenario; user is implementing veto/before-hook patterns, aggregating results from multiple listeners, chaining async handlers, cleaning up subscriptions in React useEffect, or resetting the bus between tests.
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
