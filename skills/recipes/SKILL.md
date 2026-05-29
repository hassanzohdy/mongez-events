---
name: mongez-events-recipes
description: |
  Idiomatic patterns for common @mongez/events use cases — veto hooks, aggregation, async chains, React cleanup, and test teardown.
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

## Debugging — list live subscriptions under a namespace

```ts
const snapshot = events.getByNamespaceArray("users");
console.table(snapshot.map(e => ({ event: e.event, count: e.subscriptions.length })));
```

`getByNamespaceArray` matches at segment boundaries, so you need a real
namespace prefix — passing `""` matches nothing because the matcher is
`event === namespace || event.startsWith(namespace + ".")` and no real
event name starts with `.`. There is no public "every event" iterator;
for full-bus introspection, expose a helper from your own side or walk
the namespaces you actually subscribe under (`atoms`, `users`, etc.).
