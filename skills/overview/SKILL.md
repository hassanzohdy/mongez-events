---
name: mongez-events-overview
description: |
  High-level orientation to the @mongez/events package — what it is, the mental model behind the global bus, and when to reach for it over alternatives.
---

# @mongez/events — Overview

A tiny, zero-dependency event bus. Subscribe to a named event, trigger it from anywhere, and clean up a whole namespace of subscriptions in one call. It's the substrate `@mongez/atom` uses under the hood for atom lifecycle events — and it's perfectly usable on its own for any pub/sub flow.

## Highlighted features

<div class="mongez-highlights">

<div class="mongez-highlight" data-accent="ice">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
  <h3>One global bus, zero deps</h3>
  <p>Module-level singleton, no provider, no setup. Import <code>events</code> and you're in.</p>
</div>

<div class="mongez-highlight" data-accent="ice">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
  <h3>Namespace-scoped cleanup</h3>
  <p>Subscribe to <code>users.created</code>, <code>users.deleted</code>, <code>users.updated</code> — then drop them all with <code>events.unsubscribeNamespace("users")</code>.</p>
</div>

<div class="mongez-highlight" data-accent="fire">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
  <h3>Stop-on-false chain</h3>
  <p>Any handler can short-circuit the chain by returning <code>false</code>. Perfect for cancellable beforeXxx events.</p>
</div>

<div class="mongez-highlight" data-accent="bolt">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  <h3>Powers <code>@mongez/atom</code></h3>
  <p>Atom lifecycle (<code>atoms.&lt;key&gt;.update</code>, <code>reset</code>, <code>delete</code>) is built on this bus. Same primitive, smaller bundle.</p>
</div>

</div>

## Install

```sh
npm install @mongez/events
# or: yarn add @mongez/events
# or: pnpm add @mongez/events
```

Zero runtime dependencies.

## Quick peek

```ts
import events from "@mongez/events";

const sub = events.subscribe("cart.update", cart => {
  console.log("cart now has", cart.totalQuantity, "items");
});

events.trigger("cart.update", { totalQuantity: 3 });

sub.unsubscribe();
```

Subscribe from anywhere, trigger from anywhere, hold the returned `EventSubscription` and call `.unsubscribe()` when done.

## Mental model

- **One global bus instance.** `events` is a module-level singleton. All subscribers share it.
- **Events are strings with dot-separated segments.** `users.created`, `cart.checkout`, `atoms.userAtom.update`.
- **Namespaces are event-name prefixes** that match at segment boundaries. Cleanup by namespace wipes a whole subtree without touching unrelated events.
- **Subscriptions return an object**, not an unsubscribe function. Hold the returned `EventSubscription` and call `.unsubscribe()` when done.

## Where to go next

- **[Events bus](../bus/)** — `subscribe`, `trigger`, `unsubscribe`, advanced patterns
- **[Namespaces](../namespaces/)** — namespace-scoped cleanup, query helpers
- **[Recipes](../recipes/)** — common patterns (auth, cart, atom integration)
